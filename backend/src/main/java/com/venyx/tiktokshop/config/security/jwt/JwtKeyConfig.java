package com.venyx.tiktokshop.config.security.jwt;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Arrays;
import java.util.Base64;
import java.util.UUID;

/**
 * Configuração das chaves de assinatura do JWT.
 * 
 * Em produção: carrega as chaves RSA das variáveis de ambiente codificadas em Base64.
 * Em perfil de teste: gera chaves efêmeras (aceitável apenas para testes).
 * 
 * Isso garante que os tokens permaneçam válidos entre reinicializações da aplicação
 * e permite o escalonamento horizontal com múltiplas instâncias.
 */
@Configuration
public class JwtKeyConfig {

    private static final Logger logger = LoggerFactory.getLogger(JwtKeyConfig.class);
    private static final String KEY_ID = "rota-saude-jwt-key-v1";

    private final Environment environment;

    @Value("${security.jwt.private-key:}")
    private String privateKeyBase64;

    @Value("${security.jwt.public-key:}")
    private String publicKeyBase64;

    public JwtKeyConfig(Environment environment) {
        this.environment = environment;
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        RSAKey rsaKey;

        if (isTestProfile()) {
            logger.info("Test profile - generating ephemeral RSA keys");
            rsaKey = generateEphemeralRsaKey();
        } else if (hasConfiguredKeys()) {
            logger.info("Loading RSA keys from configuration");
            rsaKey = loadRsaKeysFromConfig();
        } else {
            logger.warn("No RSA keys configured - generating ephemeral keys (NOT RECOMMENDED FOR PRODUCTION)");
            rsaKey = generateEphemeralRsaKey();
        }

        JWKSet jwkSet = new JWKSet(rsaKey);
        return (jwkSelector, securityContext) -> jwkSelector.select(jwkSet);
    }

    /**
     * Loads RSA keys from Base64-encoded configuration properties.
     * 
     * Expected format: PEM file content encoded in Base64
     * The PEM headers (-----BEGIN/END-----) should be removed before Base64
     * encoding.
     */
    private RSAKey loadRsaKeysFromConfig() {
        try {
            // Decode Base64 to get the key bytes
            byte[] privateKeyBytes = Base64.getDecoder().decode(
                    cleanKeyString(privateKeyBase64));
            byte[] publicKeyBytes = Base64.getDecoder().decode(
                    cleanKeyString(publicKeyBase64));

            KeyFactory keyFactory = KeyFactory.getInstance("RSA");

            // Parse private key (PKCS#8 format)
            PKCS8EncodedKeySpec privateKeySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
            RSAPrivateKey privateKey = (RSAPrivateKey) keyFactory.generatePrivate(privateKeySpec);

            // Parse public key (X.509 format)
            X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(publicKeyBytes);
            RSAPublicKey publicKey = (RSAPublicKey) keyFactory.generatePublic(publicKeySpec);

            return new RSAKey.Builder(publicKey)
                    .privateKey(privateKey)
                    .keyID(KEY_ID)
                    .build();

        } catch (Exception e) {
            logger.error("Failed to load RSA keys from configuration", e);
            throw new IllegalStateException("Invalid RSA key configuration. " +
                    "Ensure JWT_PRIVATE_KEY and JWT_PUBLIC_KEY are valid Base64-encoded keys.", e);
        }
    }

    /**
     * Generates ephemeral RSA keys for testing or development.
     * WARNING: These keys change on every restart, invalidating all existing
     * tokens.
     */
    private RSAKey generateEphemeralRsaKey() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            KeyPair keyPair = keyPairGenerator.generateKeyPair();

            RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
            RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();

            // Use random key ID for ephemeral keys to avoid confusion
            String ephemeralKeyId = "ephemeral-" + UUID.randomUUID().toString().substring(0, 8);

            return new RSAKey.Builder(publicKey)
                    .privateKey(privateKey)
                    .keyID(ephemeralKeyId)
                    .build();

        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate RSA key pair", e);
        }
    }

    /**
     * Cleans the key string by removing whitespace and newlines.
     */
    private String cleanKeyString(String key) {
        return key.replaceAll("\\s+", "");
    }

    private boolean isTestProfile() {
        return Arrays.asList(environment.getActiveProfiles()).contains("test");
    }

    private boolean hasConfiguredKeys() {
        return privateKeyBase64 != null && !privateKeyBase64.isBlank()
                && publicKeyBase64 != null && !publicKeyBase64.isBlank();
    }

    @Bean
    public JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) {
        return new NimbusJwtEncoder(jwkSource);
    }

    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
        return NimbusJwtDecoder.withJwkSource(jwkSource).build();
    }
}
