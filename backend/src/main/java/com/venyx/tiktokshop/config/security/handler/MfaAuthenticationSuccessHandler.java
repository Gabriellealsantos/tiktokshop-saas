package com.venyx.tiktokshop.config.security.handler;

import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.repositories.UserRepository;
import com.venyx.tiktokshop.services.AuthSecurityService;
import com.venyx.tiktokshop.services.JwtTokenService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.RequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Manipulador de sucesso de autenticação para MFA.
 * Intercepta o login bem-sucedido e, se o MFA estiver ativado para o usuário,
 * redireciona para a verificação do segundo fator em vez de liberar o acesso
 * direto.
 */
@Component
public class MfaAuthenticationSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenService jwtTokenService;
    private final AuthSecurityService authSecurityService;
    private final RequestCache requestCache = new HttpSessionRequestCache();

    public MfaAuthenticationSuccessHandler(UserRepository userRepository,
                                           JwtTokenService jwtTokenService,
                                           AuthSecurityService authSecurityService,
                                           @Value("${cors.origins}") String corsOrigins) {
        this.userRepository = userRepository;
        this.jwtTokenService = jwtTokenService;
        this.authSecurityService = authSecurityService;

        // Fallback: redireciona pro frontend (primeiro origin configurado)
        String frontendUrl = corsOrigins.split(",")[0].trim();
        setDefaultTargetUrl(frontendUrl);
        setAlwaysUseDefaultTargetUrl(false);
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws ServletException, IOException {

        String email = authentication.getName();
        User user = userRepository.findByEmailWithRoles(email).orElse(null);

        // Sessão única: recusa antes de qualquer token ser emitido, derrubando a
        // sessão de cookie recém-criada para que /oauth2/authorize exija login de novo.
        // Admin fica de fora dessa regra: sem exceção, um admin travado por ela não
        // teria como entrar de novo nem para desligar o próprio switch.
        boolean isAdmin = user != null && user.hasRole(RoleConstants.ROLE_ADMIN);
        if (!isAdmin && authSecurityService.isLoginBlockedByActiveSession(email)) {
            SecurityContextHolder.clearContext();
            HttpSession current = request.getSession(false);
            if (current != null) {
                current.invalidate();
            }
            getRedirectStrategy().sendRedirect(request, response, "/login?error=session_in_use");
            return;
        }

        // ── MFA ativo: redireciona para verificação ──
        if (user != null && Boolean.TRUE.equals(user.getMfaEnabled())) {
            // Preserva a saved request na nova session antes de limpar
            SavedRequest savedRequest = requestCache.getRequest(request, response);
            String continueUrl = savedRequest != null ? savedRequest.getRedirectUrl() : null;

            SecurityContextHolder.clearContext();
            request.getSession().invalidate();

            HttpSession newSession = request.getSession(true);

            // Salva a URL de continuação na nova session
            if (continueUrl != null) {
                newSession.setAttribute("CONTINUE_URL", continueUrl);
            }

            String preAuthToken = jwtTokenService.generatePreAuthToken(user);
            getRedirectStrategy().sendRedirect(request, response,
                    "/mfa-login-verify?token=" + preAuthToken);
            return;
        }

        // ── MFA desativado: fluxo normal ──
        // Tenta recuperar a saved request da session atual
        SavedRequest savedRequest = requestCache.getRequest(request, response);

        if (savedRequest != null) {
            // Saved request existe — deixa o super redirecionar para ela
            super.onAuthenticationSuccess(request, response, authentication);
        } else {
            // Saved request perdida — recupera da session se possível
            HttpSession session = request.getSession(false);
            String continueUrl = session != null
                    ? (String) session.getAttribute("CONTINUE_URL")
                    : null;

            if (continueUrl != null) {
                session.removeAttribute("CONTINUE_URL");
                getRedirectStrategy().sendRedirect(request, response, continueUrl);
            } else {
                // Último fallback: redireciona para defaultTargetUrl
                super.onAuthenticationSuccess(request, response, authentication);
            }
        }
    }
}
