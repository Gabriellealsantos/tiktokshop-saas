-- Seed mínimo para o perfil de teste (H2). Em dev/prod o schema vem do Flyway.
INSERT INTO tb_role (authority, description) VALUES ('ROLE_SUPER_ADMIN', 'Administrador máximo da plataforma');
INSERT INTO tb_role (authority, description) VALUES ('ROLE_ADMIN', 'Administrador');
INSERT INTO tb_role (authority, description) VALUES ('ROLE_CLIENT', 'Usuário cliente da plataforma');
INSERT INTO tb_role (authority, description) VALUES ('ROLE_AFFILIATE', 'Afiliado — vende e vê faturamento');
