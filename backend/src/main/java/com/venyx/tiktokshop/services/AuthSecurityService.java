package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.AuthSecuritySettingsDTO;
import com.venyx.tiktokshop.entities.AuthSecuritySettings;
import com.venyx.tiktokshop.repositories.AuthSecuritySettingsRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;

/**
 * Switch global de sessão única: quando ligado, uma conta só pode estar em uso
 * em um lugar por vez e o segundo login é recusado antes de qualquer token ser
 * emitido.
 *
 * "Em uso" é definido pelo access token (curto, ~15 min) e não pelo refresh token
 * (20 dias): assim quem fecha o navegador sem deslogar não fica travado fora da
 * própria conta por semanas.
 */
@Service
public class AuthSecurityService {

    /** Marcador que o servidor de autorização grava ao revogar um token (logout). */
    private static final String INVALIDATED_MARKER =
            "\"" + OAuth2Authorization.Token.INVALIDATED_METADATA_NAME + "\":true";

    private static final String ACTIVE_SESSION_SQL = """
            SELECT COUNT(*) FROM oauth2_authorization
            WHERE principal_name = ?
              AND access_token_expires_at > ?
              AND (access_token_metadata IS NULL OR access_token_metadata NOT LIKE ?)
            """;

    private final AuthSecuritySettingsRepository repository;
    private final JdbcTemplate jdbcTemplate;

    public AuthSecurityService(AuthSecuritySettingsRepository repository, JdbcTemplate jdbcTemplate) {
        this.repository = repository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public AuthSecuritySettingsDTO getSettings() {
        return new AuthSecuritySettingsDTO(requireSettings().isSingleSessionEnforced());
    }

    @Transactional
    public AuthSecuritySettingsDTO updateSettings(AuthSecuritySettingsDTO body) {
        AuthSecuritySettings settings = requireSettings();
        settings.setSingleSessionEnforced(Boolean.TRUE.equals(body.singleSessionEnforced()));
        return new AuthSecuritySettingsDTO(repository.save(settings).isSingleSessionEnforced());
    }

    @Transactional(readOnly = true)
    public boolean isSingleSessionEnforced() {
        return requireSettings().isSingleSessionEnforced();
    }

    /**
     * True quando o switch está ligado e a conta já tem um access token válido
     * (não expirado e não revogado) em outro dispositivo.
     */
    @Transactional(readOnly = true)
    public boolean isLoginBlockedByActiveSession(String principalName) {
        if (principalName == null || !isSingleSessionEnforced()) {
            return false;
        }
        Long count = jdbcTemplate.queryForObject(ACTIVE_SESSION_SQL, Long.class,
                principalName, Timestamp.from(Instant.now()), "%" + INVALIDATED_MARKER + "%");
        return count != null && count > 0;
    }

    /** A linha singleton vem da migration; o fallback evita NPE se o banco for zerado à mão. */
    private AuthSecuritySettings requireSettings() {
        return repository.findTopByOrderByIdAsc().orElseGet(AuthSecuritySettings::new);
    }
}