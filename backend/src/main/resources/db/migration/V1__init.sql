-- =====================================================================
-- V1 — Schema inicial: autenticação + créditos/planos/assinaturas (Fase 0)
-- As tabelas oauth2_* são criadas em runtime pelo OAuth2SchemaInitializer.
-- =====================================================================

-- ---------- Roles ----------
CREATE TABLE tb_role (
    id          BIGSERIAL PRIMARY KEY,
    authority   VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- ---------- Usuários ----------
CREATE TABLE tb_user (
    uuid                  UUID PRIMARY KEY,
    name                  VARCHAR(255),
    email                 VARCHAR(255) UNIQUE,
    cpf                   VARCHAR(255) UNIQUE,
    phone                 VARCHAR(255) UNIQUE,
    password              VARCHAR(255),
    user_status           VARCHAR(40),
    mfa_enabled           BOOLEAN DEFAULT FALSE,
    mfa_secret            VARCHAR(255),
    failed_login_attempts INTEGER DEFAULT 0,
    lockout_end_time      TIMESTAMP WITHOUT TIME ZONE,
    created_at            TIMESTAMP WITHOUT TIME ZONE,
    updated_at            TIMESTAMP WITHOUT TIME ZONE,
    deleted_at            TIMESTAMP WITHOUT TIME ZONE
);

-- ---------- Vínculo usuário <-> role ----------
CREATE TABLE tb_user_role (
    user_id UUID   NOT NULL REFERENCES tb_user(uuid),
    role_id BIGINT NOT NULL REFERENCES tb_role(id),
    PRIMARY KEY (user_id, role_id)
);

-- ---------- Recuperação de senha ----------
CREATE TABLE tb_password_recover (
    id         BIGSERIAL PRIMARY KEY,
    token      VARCHAR(255) NOT NULL,
    expiration TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    user_id    UUID REFERENCES tb_user(uuid)
);

-- ---------- Confirmação de e-mail ----------
CREATE TABLE tb_email_confirmation (
    uuid         UUID PRIMARY KEY,
    token        VARCHAR(100) NOT NULL UNIQUE,
    user_uuid    UUID NOT NULL REFERENCES tb_user(uuid),
    expiration   TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    confirmed_at TIMESTAMP WITHOUT TIME ZONE,
    created_at   TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- ---------- Auth code (troca pós-login para o SPA) ----------
CREATE TABLE tb_auth_code (
    id         BIGSERIAL PRIMARY KEY,
    code       VARCHAR(255) NOT NULL UNIQUE,
    user_id    UUID NOT NULL REFERENCES tb_user(uuid),
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    used       BOOLEAN NOT NULL DEFAULT FALSE
);

-- ---------- Códigos de recuperação MFA ----------
CREATE TABLE tb_user_recovery_code (
    id          BIGSERIAL PRIMARY KEY,
    hashed_code VARCHAR(255) NOT NULL,
    user_id     UUID NOT NULL REFERENCES tb_user(uuid)
);

-- ---------- Planos ----------
CREATE TABLE plans (
    id            BIGSERIAL PRIMARY KEY,
    type          VARCHAR(20) NOT NULL,
    duration_days INTEGER,
    price         NUMERIC(12, 2)
);

-- ---------- Assinaturas ----------
CREATE TABLE user_subscriptions (
    id         BIGSERIAL PRIMARY KEY,
    started_at TIMESTAMP WITHOUT TIME ZONE,
    expires_at TIMESTAMP WITHOUT TIME ZONE,
    status     VARCHAR(20) NOT NULL,
    user_id    UUID NOT NULL REFERENCES tb_user(uuid),
    plan_id    BIGINT NOT NULL REFERENCES plans(id)
);

-- ---------- Carteira de créditos ----------
CREATE TABLE credit_wallets (
    id         BIGSERIAL PRIMARY KEY,
    balance    INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    user_id    UUID UNIQUE REFERENCES tb_user(uuid)
);

-- ---------- Transações de crédito ----------
CREATE TABLE credit_transactions (
    id           BIGSERIAL PRIMARY KEY,
    amount       INTEGER NOT NULL,
    reason       VARCHAR(40) NOT NULL,
    reference_id VARCHAR(255),
    created_at   TIMESTAMP WITHOUT TIME ZONE,
    wallet_id    BIGINT NOT NULL REFERENCES credit_wallets(id)
);

-- ---------- Seed de roles (3 níveis: ADM / Afiliado / Usuário) ----------
INSERT INTO tb_role (authority, description) VALUES
    ('ROLE_ADMIN',     'ADM — dono/sócios: faturamento, aprovação, marca afiliado, gerencia catálogo'),
    ('ROLE_AFFILIATE', 'Afiliado — também vende: vê faturamento e libera acesso, sem gerenciar catálogo'),
    ('ROLE_CLIENT',    'Usuário cliente da plataforma');
