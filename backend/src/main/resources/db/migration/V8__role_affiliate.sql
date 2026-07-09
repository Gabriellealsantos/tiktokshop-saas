INSERT INTO tb_role (authority, description)
VALUES ('ROLE_AFFILIATE', 'Afiliado — vende e vê faturamento')
    ON CONFLICT (authority) DO NOTHING;