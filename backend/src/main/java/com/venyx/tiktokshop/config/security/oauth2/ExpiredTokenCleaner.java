package com.venyx.tiktokshop.config.security.oauth2;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;

/**
 * Limpador agendado de tokens expirados.
 * Remove periodicamente os registros da tabela `oauth2_authorization` cujos tokens
 * de acesso e atualização já venceram, mantendo o banco de dados limpo.
 */
@Component
public class ExpiredTokenCleaner {

    private static final Logger logger = LoggerFactory.getLogger(ExpiredTokenCleaner.class);
    private final JdbcTemplate jdbcTemplate;

    public ExpiredTokenCleaner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Roda todos os dias às 04:00 da manhã
    @Scheduled(cron = "0 0 4 * * *")
    @Transactional
    public void cleanExpiredTokens() {
        logger.info("Iniciando limpeza de tokens OAuth2 expirados...");

        Timestamp now = Timestamp.from(Instant.now());

        String sql = """
        DELETE FROM oauth2_authorization
        WHERE (access_token_expires_at IS NULL OR access_token_expires_at < ?)
          AND (refresh_token_expires_at IS NULL OR refresh_token_expires_at < ?)
          AND (authorization_code_expires_at IS NULL OR authorization_code_expires_at < ?)
          AND (oidc_id_token_expires_at IS NULL OR oidc_id_token_expires_at < ?)
          AND (
               access_token_expires_at IS NOT NULL
            OR refresh_token_expires_at IS NOT NULL
            OR authorization_code_expires_at IS NOT NULL
            OR oidc_id_token_expires_at IS NOT NULL
          )
    """;

        int deletedCount = jdbcTemplate.update(sql, now, now, now, now);

        logger.info("Limpeza concluída. Registros removidos: {}", deletedCount);
    }
}
