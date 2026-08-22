-- =====================================================================
-- V38 — Índices de geração, dashboard e notificações
-- =====================================================================

-- 1. Cota diária (GenerationLimitService.countFinalsToday) — roda em TODA geração.
CREATE INDEX IF NOT EXISTS idx_image_gen_daily_count
    ON image_generations (user_id, flow_type, created_at)
    WHERE parent_id IS NULL AND status <> 'FAILED';

-- 2. Limpeza de jobs órfãos (OrphanJobCleaner) — varre a cada 5 minutos.
CREATE INDEX IF NOT EXISTS idx_image_gen_stuck
    ON image_generations (updated_at)
    WHERE status IN ('PENDING', 'RUNNING');

-- 3. Dashboard: sumAmountBetween / countBetween / findTop10 — chamadas ~60x por abertura.
CREATE INDEX IF NOT EXISTS idx_live_sale_events_user_date
    ON live_sale_events (user_id, created_at DESC);

-- 4. Sino de notificações: existsByNotification_IdAndUser_Uuid — 1 query por item da página.
CREATE INDEX IF NOT EXISTS idx_notification_reads_lookup
    ON notification_reads (notification_id, user_id);

-- 5. Vendas ao vivo no modo USER_FAVORITES — roda a cada 8s por usuário nesse modo.
CREATE INDEX IF NOT EXISTS idx_favorites_user
    ON favorites (user_id);