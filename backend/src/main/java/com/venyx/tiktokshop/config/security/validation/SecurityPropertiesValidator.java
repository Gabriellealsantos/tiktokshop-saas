package com.venyx.tiktokshop.config.security.validation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;

import java.util.Arrays;
import java.util.List;

/**
 * Validador de propriedades críticas de segurança.
 * Verifica na inicialização da aplicação se segredos obrigatórios estão configurados
 * ou se estão usando valores padrão perigosos, interrompendo a execução se necessário.
 * 
 * Este validador é ignorado no perfil 'test' para permitir testes sem segredos reais.
 */
@Configuration
public class SecurityPropertiesValidator {

    private static final Logger logger = LoggerFactory.getLogger(SecurityPropertiesValidator.class);

    private static final List<String> DANGEROUS_DEFAULTS = List.of(
            "myclientid",
            "myclientsecret",
            "supersecretpasswordformfa123",
            "5c0744940b5c369b");

    private final Environment environment;

    @Value("${security.client-id:}")
    private String clientId;

    @Value("${security.client-secret:}")
    private String clientSecret;

    @Value("${mfa.encryption.password:}")
    private String mfaPassword;

    @Value("${mfa.encryption.salt:}")
    private String mfaSalt;

    public SecurityPropertiesValidator(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void validateSecurityProperties() {
        // Skip validation in test profile
        if (isTestProfile()) {
            logger.info("🧪 Test profile detected - skipping security validation");
            return;
        }

        logger.info("Validating security configuration...");

        StringBuilder errors = new StringBuilder();

        // Validate CLIENT_ID
        if (isBlankOrDangerous(clientId)) {
            errors.append("\n  security.client-id: Not configured or using dangerous default");
        }

        // Validate CLIENT_SECRET
        if (isBlankOrDangerous(clientSecret)) {
            errors.append("\n  security.client-secret: Not configured or using dangerous default");
        } else if (clientSecret.length() < 32) {
            errors.append("\n  security.client-secret: Must be at least 32 characters");
        }

        // Validate MFA_ENCRYPTION_PASSWORD
        if (isBlankOrDangerous(mfaPassword)) {
            errors.append("\n  mfa.encryption.password: Not configured or using dangerous default");
        } else if (mfaPassword.length() < 16) {
            errors.append("\n  mfa.encryption.password: Must be at least 16 characters");
        }

        // Validate MFA_ENCRYPTION_SALT
        if (isBlankOrDangerous(mfaSalt)) {
            errors.append("\n mfa.encryption.salt: Not configured or using dangerous default");
        } else if (mfaSalt.length() != 16) {
            errors.append("\n mfa.encryption.salt: Must be exactly 16 hex characters");
        }

        if (!errors.isEmpty()) {
            String message = """

                    ╔══════════════════════════════════════════════════════════════════╗
                    ║                    SECURITY CONFIGURATION ERROR                   ║
                    ╠══════════════════════════════════════════════════════════════════╣
                    ║  Critical security properties are missing or misconfigured.       ║
                    ║  The application will continue but is NOT SECURE for production.  ║
                    ╚══════════════════════════════════════════════════════════════════╝

                    Issues found:%s

                    To fix, set these environment variables:
                      - CLIENT_ID: OAuth2 client identifier
                      - CLIENT_SECRET: OAuth2 client secret (min 32 chars)
                      - MFA_ENCRYPTION_PASSWORD: Password for MFA secret encryption (min 16 chars)
                      - MFA_ENCRYPTION_SALT: 16-character hex salt for encryption

                    For production, also set:
                      - JWT_PRIVATE_KEY: Base64-encoded RSA private key
                      - JWT_PUBLIC_KEY: Base64-encoded RSA public key
                    """.formatted(errors);

            logger.error(message);

            // In dev profile, warn but don't crash
            if (isDevProfile()) {
                logger.warn("Dev profile - continuing despite security warnings");
            } else {
                throw new SecurityConfigurationException(
                        "Security configuration is invalid. See logs for details.");
            }
        } else {
            logger.info("Security configuration validated successfully");
        }
    }

    private boolean isTestProfile() {
        return Arrays.asList(environment.getActiveProfiles()).contains("test");
    }

    private boolean isDevProfile() {
        return Arrays.asList(environment.getActiveProfiles()).contains("dev");
    }

    private boolean isBlankOrDangerous(String value) {
        if (value == null || value.isBlank()) {
            return true;
        }
        return DANGEROUS_DEFAULTS.stream().anyMatch(dangerous -> value.equalsIgnoreCase(dangerous));
    }

    /**
     * Custom exception for security configuration errors.
     */
    public static class SecurityConfigurationException extends RuntimeException {
        public SecurityConfigurationException(String message) {
            super(message);
        }
    }
}
