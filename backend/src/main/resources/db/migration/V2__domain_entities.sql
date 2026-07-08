-- =====================================================================
-- V2 — Base de entidades de domínio (Fases 2–5 + módulos opcionais)
-- =====================================================================

-- =====================================================================
-- FASE 2 — Dashboard
-- =====================================================================
CREATE TABLE dashboard_metrics (
    id          BIGSERIAL PRIMARY KEY,
    period_type VARCHAR(20) NOT NULL,
    period_ref  VARCHAR(255) NOT NULL,
    revenue     NUMERIC(14, 2),
    orders      INTEGER,
    commission  NUMERIC(14, 2),
    avg_ticket  NUMERIC(14, 2),
    updated_at  TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT uq_dashboard_period UNIQUE (period_type, period_ref)
);

-- =====================================================================
-- FASE 3 — Produtos
-- =====================================================================
CREATE TABLE products (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    description      TEXT,
    image_url        VARCHAR(1024),
    category         VARCHAR(40),
    sales            INTEGER DEFAULT 0,
    views            INTEGER DEFAULT 0,
    affiliate_link   VARCHAR(1024),
    created_by_admin BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX idx_products_category ON products(category);

CREATE TABLE user_products (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES tb_user(uuid),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    image_url   VARCHAR(1024),
    created_at  TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX idx_user_products_user ON user_products(user_id);

CREATE TABLE favorites (
    id         BIGSERIAL PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES tb_user(uuid),
    product_id BIGINT NOT NULL REFERENCES products(id),
    created_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT uq_favorite UNIQUE (user_id, product_id)
);

-- =====================================================================
-- FASE 4 — Estúdio (config volátil em JSONB)
-- =====================================================================
CREATE TABLE creation_sessions (
    id         BIGSERIAL PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES tb_user(uuid),
    product_id BIGINT REFERENCES products(id),
    format     VARCHAR(20) NOT NULL,
    status     VARCHAR(20) NOT NULL,
    config     JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX idx_creation_sessions_user ON creation_sessions(user_id);

CREATE TABLE avatars (
    id         BIGSERIAL PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES tb_user(uuid),
    name       VARCHAR(255) NOT NULL,
    config     JSONB,
    image_url  VARCHAR(1024),
    created_at TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX idx_avatars_user ON avatars(user_id);

-- =====================================================================
-- FASE 5 — Notificações (web push)
-- =====================================================================
CREATE TABLE push_subscriptions (
    id         BIGSERIAL PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES tb_user(uuid),
    endpoint   TEXT NOT NULL,
    p256dh     VARCHAR(255) NOT NULL,
    auth       VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);

CREATE TABLE notifications (
    id         BIGSERIAL PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    body       TEXT,
    image_url  VARCHAR(1024),
    click_url  VARCHAR(1024),
    audience   VARCHAR(20) NOT NULL,
    created_by UUID REFERENCES tb_user(uuid),
    created_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE notification_targets (
    id              BIGSERIAL PRIMARY KEY,
    notification_id BIGINT NOT NULL REFERENCES notifications(id),
    user_id         UUID NOT NULL REFERENCES tb_user(uuid),
    CONSTRAINT uq_notification_target UNIQUE (notification_id, user_id)
);

CREATE TABLE notification_deliveries (
    id              BIGSERIAL PRIMARY KEY,
    notification_id BIGINT NOT NULL REFERENCES notifications(id),
    user_id         UUID NOT NULL REFERENCES tb_user(uuid),
    status          VARCHAR(20) NOT NULL,
    error           TEXT,
    sent_at         TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX idx_notification_deliveries_notif ON notification_deliveries(notification_id);

-- =====================================================================
-- OPC-1 — Galeria de Prompts
-- =====================================================================
CREATE TABLE prompts (
    id               BIGSERIAL PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    content          TEXT NOT NULL,
    category         VARCHAR(20),
    created_by_admin BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX idx_prompts_category ON prompts(category);

-- =====================================================================
-- OPC-2 — Modelos Virais
-- =====================================================================
CREATE TABLE viral_templates (
    id               BIGSERIAL PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    thumbnail_url    VARCHAR(1024),
    reference_url    VARCHAR(1024),
    tags             JSONB,
    created_by_admin BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMP WITHOUT TIME ZONE
);

-- =====================================================================
-- OPC-4 — Vendas ao Vivo (prova social)
-- =====================================================================
CREATE TABLE live_sales_config (
    id               BIGSERIAL PRIMARY KEY,
    enabled          BOOLEAN NOT NULL DEFAULT FALSE,
    interval_seconds INTEGER,
    updated_at       TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE live_sales_items (
    id           BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    image_url    VARCHAR(1024),
    commission   NUMERIC(12, 2),
    active       BOOLEAN NOT NULL DEFAULT TRUE,
    order_index  INTEGER
);

-- =====================================================================
-- OPC-5 — Programa de Indicação
-- =====================================================================
CREATE TABLE referral_codes (
    id         BIGSERIAL PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES tb_user(uuid),
    code       VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE referrals (
    id               BIGSERIAL PRIMARY KEY,
    referrer_id      UUID NOT NULL REFERENCES tb_user(uuid),
    referred_user_id UUID NOT NULL REFERENCES tb_user(uuid),
    status           VARCHAR(20) NOT NULL,
    created_at       TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);

CREATE TABLE referral_commissions (
    id          BIGSERIAL PRIMARY KEY,
    referral_id BIGINT NOT NULL REFERENCES referrals(id),
    amount      NUMERIC(12, 2),
    split_pct   INTEGER,
    status      VARCHAR(20) NOT NULL,
    paid_at     TIMESTAMP WITHOUT TIME ZONE,
    created_at  TIMESTAMP WITHOUT TIME ZONE
);

-- =====================================================================
-- Seed dos planos (preços [A DEFINIR] pelo dono)
-- =====================================================================
INSERT INTO plans (type, duration_days, price) VALUES
    ('MONTHLY', 30, NULL),
    ('LIFETIME', NULL, NULL);
