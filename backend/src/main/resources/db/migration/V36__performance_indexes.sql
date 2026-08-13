-- =====================================================================
-- V36 — Índices de Performance
-- =====================================================================

-- 1. Otimiza feed de produtos: findByCategoryAndActiveTrueOrderByRankPositionAsc
CREATE INDEX IF NOT EXISTS idx_products_catalog ON products (category_id, active, rank_position);

-- 2. Otimiza consultas por produtos ativos recentes: countByActiveTrueAndCreatedAtAfter
CREATE INDEX IF NOT EXISTS idx_products_recent ON products (active, created_at);

-- 3. Otimiza busca na aba de notificações (inbox/unread): type <> 'SALE' e createdAt >= since
CREATE INDEX IF NOT EXISTS idx_notifications_inbox ON notifications (created_at DESC, type, audience);

-- 4. Otimiza extrato de transações de crédito (busca por carteira com ordenação decrescente)
CREATE INDEX IF NOT EXISTS idx_credit_transactions_wallet ON credit_transactions (wallet_id, created_at DESC);

-- 5. Otimiza query de background job: busca de inscrições ativas e expiradas
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expiration ON user_subscriptions (status, expires_at);

-- 6. Otimiza validação de token em recuperação de senha
CREATE INDEX IF NOT EXISTS idx_password_recover_token ON tb_password_recover (token);

-- 7. Otimiza recuperação de MFA (busca direta por hash)
CREATE INDEX IF NOT EXISTS idx_user_recovery_code_hash ON tb_user_recovery_code (hashed_code);
