-- =====================================================================
-- V4 — Vendas ao Vivo: engine com modo (manual/automático/desligado) e
-- log de eventos que alimenta o feed e o rollup do dashboard
-- =====================================================================

ALTER TABLE live_sales_config
    ADD COLUMN mode VARCHAR(20) NOT NULL DEFAULT 'DISABLED',
    DROP COLUMN enabled;

-- Garante uma única linha de configuração (idempotente).
INSERT INTO live_sales_config (mode, interval_seconds, updated_at)
SELECT 'DISABLED', 8, now()
WHERE NOT EXISTS (SELECT 1 FROM live_sales_config);

CREATE TABLE live_sale_events (
    id           BIGSERIAL PRIMARY KEY,
    product_id   BIGINT REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    image_url    VARCHAR(1024),
    amount       NUMERIC(12, 2),
    commission   NUMERIC(12, 2),
    created_at   TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX idx_live_sale_events_created_at ON live_sale_events(created_at);

-- Substituída por live_sale_events: fonte de uma venda agora é sempre um
-- Product real cadastrado, não um item curado à parte.
DROP TABLE live_sales_items;
