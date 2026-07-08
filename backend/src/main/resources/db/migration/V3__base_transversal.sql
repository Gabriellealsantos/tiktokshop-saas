-- =====================================================================
-- V3 — Base transversal: geração assíncrona, pacotes de crédito e
-- complementos de schema exigidos pelo front (ARQUITETURA.md ⬜)
-- =====================================================================

-- =====================================================================
-- Geração assíncrona (Estúdio, Avatares, Trend Boost, Ferramentas)
-- Débito de crédito ANTES da geração; estorno em falha via credit_tx_id.
-- =====================================================================
CREATE TABLE generation_jobs (
    id           BIGSERIAL PRIMARY KEY,
    user_id      UUID NOT NULL REFERENCES tb_user(uuid),
    type         VARCHAR(30) NOT NULL,
    status       VARCHAR(20) NOT NULL,
    reference_id VARCHAR(255),
    credit_tx_id BIGINT REFERENCES credit_transactions(id),
    payload      JSONB,
    result       JSONB,
    error        TEXT,
    created_at   TIMESTAMP WITHOUT TIME ZONE,
    updated_at   TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX idx_generation_jobs_user ON generation_jobs(user_id);
CREATE INDEX idx_generation_jobs_status ON generation_jobs(status);

-- =====================================================================
-- Planos: front usa mensal/trimestral/semestral/anual/vitalício
-- (preços [A DEFINIR] pelo dono)
-- =====================================================================
INSERT INTO plans (type, duration_days, price) VALUES
    ('QUARTERLY',  90,  NULL),
    ('SEMIANNUAL', 180, NULL),
    ('ANNUAL',     365, NULL);

-- =====================================================================
-- Produtos: KPIs exibidos no modal de detalhe da vitrine
-- =====================================================================
ALTER TABLE products
    ADD COLUMN price             NUMERIC(12, 2),
    ADD COLUMN commission_pct    NUMERIC(5, 2),
    ADD COLUMN estimated_revenue NUMERIC(14, 2),
    ADD COLUMN conversion_rate   NUMERIC(5, 2),
    ADD COLUMN sales_per_day     NUMERIC(8, 2),
    ADD COLUMN delta_7d          NUMERIC(6, 2),
    ADD COLUMN history_7d        JSONB,
    ADD COLUMN mining_window     VARCHAR(40),
    ADD COLUMN trend_label       VARCHAR(60),
    ADD COLUMN rank_position     INTEGER,
    ADD COLUMN images            JSONB;

-- =====================================================================
-- Galeria de avatares pré-prontos (Mulheres / Homens / Modelos IA),
-- gerenciada pelo admin — distinta dos avatares criados pelo usuário
-- =====================================================================
CREATE TABLE gallery_avatars (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    gender      VARCHAR(20),
    type        VARCHAR(30),
    image_url   VARCHAR(1024),
    config      JSONB,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    order_index INTEGER,
    created_at  TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX idx_gallery_avatars_gender ON gallery_avatars(gender);

-- =====================================================================
-- Insights do dashboard ("Tendências" + "Leitura do momento"),
-- conteúdo manual editado pelo admin
-- =====================================================================
CREATE TABLE dashboard_insights (
    id          BIGSERIAL PRIMARY KEY,
    kind        VARCHAR(20) NOT NULL, -- CARD | MOMENT_READ
    title       VARCHAR(255),
    content     TEXT,
    order_index INTEGER,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at  TIMESTAMP WITHOUT TIME ZONE
);

-- =====================================================================
-- Página de divulgação personalizada do programa de indicação
-- =====================================================================
ALTER TABLE referral_codes
    ADD COLUMN page_title   VARCHAR(255),
    ADD COLUMN page_message TEXT;
