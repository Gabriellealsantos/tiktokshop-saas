-- Indices de caminho quente que faltavam. Sem eles, cada tick de 5s do
-- LiveSalesScheduler e cada carregamento de pagina fazem varredura completa.

-- live_sales_config.user_id: lido em todo getConfig, updateConfig e geracao de venda.
-- A coluna nasceu na V37 sem indice.
CREATE INDEX IF NOT EXISTS idx_live_sales_config_user
    ON live_sales_config (user_id);

-- live_sales_config.mode: o scheduler busca todos os AUTOMATIC a cada 5 segundos.
CREATE INDEX IF NOT EXISTS idx_live_sales_config_mode
    ON live_sales_config (mode);

-- user_subscriptions: o /me consulta a assinatura ativa a cada carregamento de pagina.
-- O indice existente e (status, expires_at) — prefixo errado para busca por usuario.
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status
    ON user_subscriptions (user_id, status);