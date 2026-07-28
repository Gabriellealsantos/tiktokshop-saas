-- Configuração global de segurança de autenticação (singleton, mesma ideia de live_sales_config).
-- O índice sobre oauth2_authorization.principal_name não entra aqui: aquela tabela é criada
-- em runtime pelo OAuth2SchemaInitializer, depois do Flyway.
CREATE TABLE auth_security_settings (
    id                      BIGSERIAL PRIMARY KEY,
    single_session_enforced BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at              TIMESTAMP WITHOUT TIME ZONE
);

INSERT INTO auth_security_settings (single_session_enforced) VALUES (FALSE);