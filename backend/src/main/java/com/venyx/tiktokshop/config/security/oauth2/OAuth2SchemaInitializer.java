package com.venyx.tiktokshop.config.security.oauth2;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Arrays;

/**
 * Inicializador do esquema de banco de dados para OAuth2.
 * 
 * Executado na inicialização da aplicação (via @PostConstruct) para garantir que
 * as tabelas necessárias existam antes que o JdbcRegisteredClientRepository tente usá-las.
 * 
 * Principalmente útil para o banco H2 (perfil de teste). Em produção (PostgreSQL),
 * o esquema deve ser gerenciado via Flyway ou scripts manuais.
 */
@Configuration("OAuth2SchemaInitializer")
public class OAuth2SchemaInitializer {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2SchemaInitializer.class);

    private final JdbcTemplate jdbcTemplate;
    private final Environment environment;

    public OAuth2SchemaInitializer(JdbcTemplate jdbcTemplate, Environment environment) {
        this.jdbcTemplate = jdbcTemplate;
        this.environment = environment;
    }

    @PostConstruct
    public void initializeSchema() {
        // Always try to create tables (IF NOT EXISTS makes it safe)
        logger.info("🗄️ Initializing OAuth2 schema...");

        try {
            createOAuth2Tables();
            logger.info("✅ OAuth2 schema ready");
        } catch (Exception e) {
            if (isTestProfile()) {
                logger.error("❌ Failed to initialize OAuth2 schema for tests", e);
                throw e; // Fail fast in tests
            } else {
                // In production, tables should exist from migration
                logger.warn("⚠️ OAuth2 schema initialization skipped (tables may already exist via migration)");
            }
        }
    }

    private void createOAuth2Tables() {
        // Detect database type
        boolean isH2 = isH2Database();
        String textType = isH2 ? "CLOB" : "TEXT";

        // Create oauth2_registered_client table
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS oauth2_registered_client (
                    id VARCHAR(100) NOT NULL,
                    client_id VARCHAR(100) NOT NULL,
                    client_id_issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    client_secret VARCHAR(200) DEFAULT NULL,
                    client_secret_expires_at TIMESTAMP DEFAULT NULL,
                    client_name VARCHAR(200) NOT NULL,
                    client_authentication_methods VARCHAR(1000) NOT NULL,
                    authorization_grant_types VARCHAR(1000) NOT NULL,
                    redirect_uris VARCHAR(1000) DEFAULT NULL,
                    post_logout_redirect_uris VARCHAR(1000) DEFAULT NULL,
                    scopes VARCHAR(1000) NOT NULL,
                    client_settings VARCHAR(2000) NOT NULL,
                    token_settings VARCHAR(2000) NOT NULL,
                    PRIMARY KEY (id)
                )
                """);

        // Create oauth2_authorization table
        jdbcTemplate.execute(String.format("""
                CREATE TABLE IF NOT EXISTS oauth2_authorization (
                    id VARCHAR(100) NOT NULL,
                    registered_client_id VARCHAR(100) NOT NULL,
                    principal_name VARCHAR(200) NOT NULL,
                    authorization_grant_type VARCHAR(100) NOT NULL,
                    authorized_scopes VARCHAR(1000) DEFAULT NULL,
                    attributes %1$s DEFAULT NULL,
                    state VARCHAR(500) DEFAULT NULL,
                    authorization_code_value %1$s DEFAULT NULL,
                    authorization_code_issued_at TIMESTAMP DEFAULT NULL,
                    authorization_code_expires_at TIMESTAMP DEFAULT NULL,
                    authorization_code_metadata %1$s DEFAULT NULL,
                    access_token_value %1$s DEFAULT NULL,
                    access_token_issued_at TIMESTAMP DEFAULT NULL,
                    access_token_expires_at TIMESTAMP DEFAULT NULL,
                    access_token_metadata %1$s DEFAULT NULL,
                    access_token_type VARCHAR(100) DEFAULT NULL,
                    access_token_scopes VARCHAR(1000) DEFAULT NULL,
                    oidc_id_token_value %1$s DEFAULT NULL,
                    oidc_id_token_issued_at TIMESTAMP DEFAULT NULL,
                    oidc_id_token_expires_at TIMESTAMP DEFAULT NULL,
                    oidc_id_token_metadata %1$s DEFAULT NULL,
                    refresh_token_value %1$s DEFAULT NULL,
                    refresh_token_issued_at TIMESTAMP DEFAULT NULL,
                    refresh_token_expires_at TIMESTAMP DEFAULT NULL,
                    refresh_token_metadata %1$s DEFAULT NULL,
                    user_code_value %1$s DEFAULT NULL,
                    user_code_issued_at TIMESTAMP DEFAULT NULL,
                    user_code_expires_at TIMESTAMP DEFAULT NULL,
                    user_code_metadata %1$s DEFAULT NULL,
                    device_code_value %1$s DEFAULT NULL,
                    device_code_issued_at TIMESTAMP DEFAULT NULL,
                    device_code_expires_at TIMESTAMP DEFAULT NULL,
                    device_code_metadata %1$s DEFAULT NULL,
                    PRIMARY KEY (id)
                )
                """, textType));

        // Suporta a checagem de sessão única, que filtra por principal_name.
        jdbcTemplate.execute("""
                CREATE INDEX IF NOT EXISTS idx_oauth2_authorization_principal
                    ON oauth2_authorization (principal_name)
                """);

        // Create oauth2_authorization_consent table
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS oauth2_authorization_consent (
                    registered_client_id VARCHAR(100) NOT NULL,
                    principal_name VARCHAR(200) NOT NULL,
                    authorities VARCHAR(1000) NOT NULL,
                    PRIMARY KEY (registered_client_id, principal_name)
                )
                """);
    }

    private boolean isTestProfile() {
        return Arrays.asList(environment.getActiveProfiles()).contains("test");
    }

    private boolean isH2Database() {
        try {
            String url = jdbcTemplate.getDataSource().getConnection().getMetaData().getURL();
            return url != null && url.contains("h2");
        } catch (Exception e) {
            return false;
        }
    }
}
