package com.venyx.tiktokshop.config.security.events;

import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.repositories.UserRepository;
import com.venyx.tiktokshop.services.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Ouvinte de eventos de autenticação do Spring Security.
 * Captura sucessos e falhas de login para atualizar contadores de tentativas
 * e gerenciar o bloqueio de contas.
 */
@Component
public class AuthenticationEventsListener {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationEventsListener.class);

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthenticationEventsListener(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @EventListener
    public void onFailure(AuthenticationFailureBadCredentialsEvent event) {
        Object principal = event.getAuthentication().getPrincipal();
        if (!(principal instanceof String username)) {
            return;
        }
        // Access token expirado chegando na API cai aqui tambem: o principal do
        // BearerTokenAuthenticationToken e a string do proprio token. Nao e tentativa de
        // login, nao conta como falha e nao pode aparecer no log como se fosse.
        if (!isUserIdentifier(username)) {
            logger.debug("Credencial rejeitada que nao e identificador de usuario ({} chars)", username.length());
            return;
        }
        logger.warn("Login failed for user: {}", mask(username));
        userRepository.findByEmail(username).ifPresent(authService::handleFailedLoginAttempt);
    }

    private boolean isUserIdentifier(String value) {
        return value.length() <= 120 && value.indexOf('@') > 0;
    }

    
    /**
     * O principal e o que o cliente mandou, nao dado confiavel: ja chegou aqui um access
     * token inteiro no lugar do e-mail. Log de falha de login nao pode virar via de
     * vazamento de credencial.
     */
    private String mask(String username) {
        int at = username.indexOf('@');
        if (at < 1 || username.length() > 120) {
            return "<credencial omitida, %d chars>".formatted(username.length());
        }
        String local = username.substring(0, at);
        return local.substring(0, Math.min(2, local.length())) + "***" + username.substring(at);
    }

    @EventListener
    public void onSuccess(AuthenticationSuccessEvent event) {
        Object principal = event.getAuthentication().getPrincipal();

        if (principal instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) principal;
            String username = userDetails.getUsername();

            Optional<User> userOptional = userRepository.findByEmail(username);
            userOptional.ifPresent(authService::handleSuccessfulLogin);
        } else if (principal instanceof org.springframework.security.oauth2.core.user.OAuth2User) {
            // OAuth2 login (Social), handled by SuccessHandler usually, but good to have
            // here too
            org.springframework.security.oauth2.core.user.OAuth2User oauth2User = (org.springframework.security.oauth2.core.user.OAuth2User) principal;
            String email = oauth2User.getAttribute("email");
            if (email != null) {
                userRepository.findByEmail(email).ifPresent(authService::handleSuccessfulLogin);
            }
        }
    }
}
