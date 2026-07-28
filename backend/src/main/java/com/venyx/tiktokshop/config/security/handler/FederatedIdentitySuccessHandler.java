package com.venyx.tiktokshop.config.security.handler;

import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.repositories.UserRepository;
import com.venyx.tiktokshop.services.AuthSecurityService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.stream.Collectors;
/**
 * Handler de sucesso para login federado (Google).
 *
 * Após o Google autenticar o usuário, este handler:
 * 1. Extrai o e-mail do OidcUser (retornado pelo CustomOAuth2UserService)
 * 2. Busca o User do nosso banco de dados
 * 3. Substitui o principal do SecurityContext pelo nosso User (que implementa UserDetails)
 * 4. Redireciona para a saved request (que é o /oauth2/authorize original do frontend)
 *
 * Isso garante que o Authorization Server emita o JWT com as claims corretas
 * (uid, tenantId, authorities, etc.) baseadas no nosso User, não no OidcUser do Google.
 */
@Component
public class FederatedIdentitySuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(FederatedIdentitySuccessHandler.class);

    private final UserRepository userRepository;
    private final AuthSecurityService authSecurityService;
    private final HttpSessionRequestCache requestCache;
    private final String frontendUrl;

    public FederatedIdentitySuccessHandler(UserRepository userRepository,
                                           AuthSecurityService authSecurityService,
                                           @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.userRepository = userRepository;
        this.authSecurityService = authSecurityService;
        this.frontendUrl = frontendUrl;

        this.requestCache = new HttpSessionRequestCache();
        this.requestCache.setMatchingRequestParameterName(null);
        setRequestCache(this.requestCache);
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws ServletException, IOException {

        if (authentication.getPrincipal() instanceof OidcUser oidcUser) {
            String email = oidcUser.getEmail();

            if (email != null) {
                email = email.trim().toLowerCase();

                User user = userRepository.findByEmailWithRoles(email)
                        .orElse(null);

                if (user != null) {
                    if (!user.isAccountNonLocked()) {
                        log.warn("Login federado negado: usuário bloqueado: {}", email);
                        getRedirectStrategy().sendRedirect(request, response, "/login?error=locked");
                        return;
                    }
                    if (!user.isEnabled()) {
                        log.warn("Login federado negado: usuário desabilitado: {}", email);
                        getRedirectStrategy().sendRedirect(request, response, "/login?error=disabled");
                        return;
                    }
                    // Admin fica de fora da sessão única: sem exceção, um admin travado
                    // por ela não teria como entrar de novo nem para desligar o switch.
                    if (!user.hasRole(RoleConstants.ROLE_ADMIN)
                            && authSecurityService.isLoginBlockedByActiveSession(email)) {
                        log.warn("Login federado negado: conta já em uso em outro dispositivo: {}", email);
                        SecurityContextHolder.clearContext();
                        HttpSession current = request.getSession(false);
                        if (current != null) {
                            current.invalidate();
                        }
                        getRedirectStrategy().sendRedirect(request, response, "/login?error=session_in_use");
                        return;
                    }

                    log.info("Login federado: convertendo OidcUser → UserDetails para email={}", email);

                    // Converte para UserDetails padrão do Spring — sem orders, sem lazy loading
                    var authorities = user.getRoles().stream()
                            .map(role -> new SimpleGrantedAuthority(role.getAuthority()))
                            .collect(Collectors.toSet());

                    org.springframework.security.core.userdetails.User springUser =
                            new org.springframework.security.core.userdetails.User(
                                    user.getEmail(),
                                    user.getPassword(),
                                    user.isEnabled(),
                                    true,
                                    true,
                                    user.isAccountNonLocked(),
                                    authorities
                            );

                    UsernamePasswordAuthenticationToken newAuth =
                            new UsernamePasswordAuthenticationToken(
                                    springUser,
                                    null,
                                    authorities
                            );

                    SecurityContextHolder.getContext().setAuthentication(newAuth);

                    request.getSession().setAttribute(
                            "SPRING_SECURITY_CONTEXT",
                            SecurityContextHolder.getContext()
                    );
                }
            }
        }

        SavedRequest savedRequest = requestCache.getRequest(request, response);
        if (savedRequest != null) {
            log.info("Login federado: redirecionando para saved request → {}", savedRequest.getRedirectUrl());
            super.onAuthenticationSuccess(request, response, authentication);
        } else {
            log.warn("Login federado: sem saved request, redirecionando para frontend → {}", frontendUrl);
            getRedirectStrategy().sendRedirect(request, response, frontendUrl);
        }
    }
}
