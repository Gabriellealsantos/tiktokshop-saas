-- Adiciona a coluna user_id
ALTER TABLE live_sales_config ADD COLUMN user_id UUID REFERENCES tb_user(uuid);
ALTER TABLE live_sale_events ADD COLUMN user_id UUID REFERENCES tb_user(uuid);
ALTER TABLE dashboard_metrics ADD COLUMN user_id UUID REFERENCES tb_user(uuid);

-- Migra dados existentes para o primeiro ADMIN encontrado
DO $$ 
DECLARE 
    first_admin_id UUID;
BEGIN
    SELECT u.uuid INTO first_admin_id
    FROM tb_user u
    JOIN tb_user_role ur ON u.uuid = ur.user_id
    JOIN tb_role r ON ur.role_id = r.id
    WHERE r.authority = 'ROLE_ADMIN'
    ORDER BY u.created_at ASC
    LIMIT 1;

    IF first_admin_id IS NOT NULL THEN
        UPDATE live_sales_config SET user_id = first_admin_id WHERE user_id IS NULL;
        UPDATE live_sale_events SET user_id = first_admin_id WHERE user_id IS NULL;
        UPDATE dashboard_metrics SET user_id = first_admin_id WHERE user_id IS NULL;
    END IF;
END $$;

-- Trata registros que permaneceram sem user_id caso não tenha havido admin
DELETE FROM live_sales_config WHERE user_id IS NULL;
DELETE FROM live_sale_events WHERE user_id IS NULL;
DELETE FROM dashboard_metrics WHERE user_id IS NULL;

-- Altera as colunas para NOT NULL
ALTER TABLE live_sales_config ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE live_sale_events ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE dashboard_metrics ALTER COLUMN user_id SET NOT NULL;

-- Remove a restrição única antiga
ALTER TABLE dashboard_metrics DROP CONSTRAINT IF EXISTS uq_dashboard_period;

-- Cria a nova restrição única englobando o user_id
ALTER TABLE dashboard_metrics ADD CONSTRAINT uq_dashboard_user_period UNIQUE (user_id, period_type, period_ref);
