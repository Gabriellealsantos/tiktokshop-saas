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

        if (principal instanceof String) {
            String username = (String) principal;
            logger.warn("Login failed for user: {}", username);

            Optional<User> userOptional = userRepository.findByEmail(username);

            // Try identifying by other means if email fails (fallback logic similar to
            // UserService)
            if (userOptional.isEmpty()) {
                // Try CPF or Phone if username looks like them, but for now simple email lookup
                // is safer
                // to avoid complex logic here. UserService handles loadUserByUsername so
                // usually
                // the username passed here is what the user typed.
            }

            userOptional.ifPresent(authService::handleFailedLoginAttempt);
        }
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
