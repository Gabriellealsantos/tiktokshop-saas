package com.venyx.tiktokshop.config.security.oauth2.handler;

import com.venyx.tiktokshop.entities.AuthCode;
import com.venyx.tiktokshop.repositories.AuthCodeRepository;
import com.venyx.tiktokshop.services.JwtTokenService;
import com.venyx.tiktokshop.services.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Manipulador de sucesso para login via OAuth2 (Social Login).
 * Gerencia a criação ou recuperação do usuário local após a autenticação externa
 * e gera um código de autorização temporário para completar o fluxo com o frontend.
 */
@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    // URL do seu frontend para onde o usuário será redirecionado após o login
    @Value("${cors.origins}")
    private String frontendUrl;

    private final UserService userService;

    private final JwtTokenService jwtTokenService;

    private final AuthCodeRepository authCodeRepository;

    public OAuth2LoginSuccessHandler(UserService userService, JwtTokenService jwtTokenService,  AuthCodeRepository authCodeRepository) {
        this.userService = userService;
        this.jwtTokenService = jwtTokenService;
        this.authCodeRepository = authCodeRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        DefaultOAuth2User oauth2User = (DefaultOAuth2User) authentication.getPrincipal();

        // 1. Validação de email exigida pelo provedor de identidade
        Boolean emailVerified = oauth2User.getAttribute("email_verified");
        if (emailVerified == null || !emailVerified) {
            throw new ServletException("Email not verified by identity provider");
        }

        // 2. Extração de dados do usuário
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String imageUrl = oauth2User.getAttribute("picture");

        // 3. Busca ou criação do usuário no banco de dados
        var user = userService.findOrCreateUserFromOauth(email, name, imageUrl);

        // 4. Gerar código temporário válido por apenas 60 segundos
        AuthCode authCode = new AuthCode(user, Instant.now().plus(60, ChronoUnit.SECONDS));
        authCodeRepository.save(authCode);

        // 5. Prepara a URL base do Frontend
        String redirectUrl = frontendUrl.split(",")[0];


        String targetUrl = UriComponentsBuilder.fromUriString(redirectUrl)
                .queryParam("code", authCode.getCode())
                .build().toUriString();

        response.sendRedirect(targetUrl);
    }
}
