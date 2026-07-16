-- Intervalo aleatório das vendas ao vivo automáticas: em vez de um intervalo fixo,
-- o admin pode definir uma faixa [min, max] e cada disparo sorteia um valor no range
-- (parece mais humano/orgânico). random_interval liga/desliga esse comportamento.
ALTER TABLE live_sales_config
    ADD COLUMN random_interval      BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN interval_min_seconds INTEGER,
    ADD COLUMN interval_max_seconds INTEGER;
