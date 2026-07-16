-- KPIs extras do dashboard cadastráveis pelo admin como base (somados às vendas ao
-- vivo/contadores na leitura). Itens vendidos e base de comissão crescem com as vendas;
-- visualizações e cliques crescem via contadores em tempo real (LiveMetricsCounter).
ALTER TABLE dashboard_metrics
    ADD COLUMN items_sold      INTEGER,
    ADD COLUMN commission_base NUMERIC(14, 2),
    ADD COLUMN product_views   BIGINT,
    ADD COLUMN product_clicks  BIGINT;
