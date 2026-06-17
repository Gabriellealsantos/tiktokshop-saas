package com.venyx.tiktokshop.config.security.mfa;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.recovery.RecoveryCodeGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;

/**
 * Configuração detalhada do Multi-Factor Authentication (MFA).
 * Define os geradores de segredo, validadores de código TOTP (Time-based One-Time Password)
 * e o serviço de criptografia para armazenar os segredos no banco com segurança.
 */
@Configuration
public class MfaConfig {

    @Bean
    public RecoveryCodeGenerator recoveryCodeGenerator() {
        return new RecoveryCodeGenerator();
    }

    /**
     * Bean para o SecretGenerator.
     *
     */
    @Bean
    public SecretGenerator secretGenerator() {
        return new DefaultSecretGenerator();
    }

    /**
     * Bean para o TimeProvider.
     * Esta é uma dependência necessária para o CodeVerifier.
     * Usa o relógio do sistema, que é o padrão recomendado.
     */
    @Bean
    public TimeProvider timeProvider() {
        return new SystemTimeProvider();
    }

    /**
     * Bean para o CodeGenerator.
     * Esta também é uma dependência para o CodeVerifier.
     * Usa as configurações padrão (SHA1, 6 dígitos).
     */
    @Bean
    public CodeGenerator codeGenerator() {
        return new DefaultCodeGenerator();
    }

    /**
     * Bean para o CodeVerifier.
     * Resolve o erro: "No beans of 'CodeVerifier' type found"
     * Note que ele recebe os dois beans que criamos acima como parâmetros.
     */
    @Bean
    public CodeVerifier codeVerifier(CodeGenerator codeGenerator, TimeProvider timeProvider) {
        DefaultCodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);

        // Define uma "janela" de tolerância. 1 = 1 período (30s) antes ou depois.
        // Isso ajuda a evitar falhas de login por pequenas dessincronizações de
        // relógio.
        verifier.setAllowedTimePeriodDiscrepancy(1);

        return verifier;
    }

    @Bean
    public TextEncryptor textEncryptor(
            @Value("${mfa.encryption.password}") String password,
            @Value("${mfa.encryption.salt}") String saltHex) {

        // Usa o padrão do Spring: AES-256 / CBC / PKCS5Padding
        return Encryptors.text(password, saltHex);
    }
}
