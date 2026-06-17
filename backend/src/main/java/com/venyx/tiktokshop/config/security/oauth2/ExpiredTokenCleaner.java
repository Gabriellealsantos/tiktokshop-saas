package com.venyx.tiktokshop.config.security.oauth2;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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
        logger.info("🧹 Iniciando limpeza de tokens OAuth2 expirados...");

        Instant now = Instant.now();

        // Deleta registros onde TODOS os tokens relevantes já expiraram.
        // Verifica Access Token, Refresh Token, Authorization Code e OIDC Token.
        // Sintaxe compatível com H2 e PostgreSQL.
        String sql = """
            DELETE FROM oauth2_authorization 
            WHERE (authorization_code_expires_at IS NOT NULL AND authorization_code_expires_at < ?)
               OR (access_token_expires_at IS NOT NULL AND access_token_expires_at < ?)
               OR (refresh_token_expires_at IS NOT NULL AND refresh_token_expires_at < ?)
               OR (oidc_id_token_expires_at IS NOT NULL AND oidc_id_token_expires_at < ?)
        """;

        // Nota: A lógica "OR" acima é agressiva (limpa qualquer coisa expirada).
        // Se você quiser manter o registro até que TUDO expire (ex: refresh token dura mais que access token),
        // a lógica deve ser ajustada. Para MVP, limpar o que já venceu é seguro se o token não for mais necessário.
        // A query mais segura para não matar sessões ativas (Refresh Token ainda válido) é:

        String safeSql = """
            DELETE FROM oauth2_authorization 
            WHERE (access_token_expires_at < ? OR access_token_expires_at IS NULL)
              AND (refresh_token_expires_at < ? OR refresh_token_expires_at IS NULL)
              AND (authorization_code_expires_at < ? OR authorization_code_expires_at IS NULL)
              AND (oidc_id_token_expires_at < ? OR oidc_id_token_expires_at IS NULL)
        """;

        int deletedCount = jdbcTemplate.update(safeSql, now, now, now, now);

        logger.info("Limpeza concluída. Registros removidos: {}", deletedCount);
    }
}
