-- Seed mínimo para o perfil de teste (H2). Em dev/prod o schema vem do Flyway.
INSERT INTO tb_role (authority, description) VALUES ('ROLE_ADMIN', 'ADM — dono/sócios');
INSERT INTO tb_role (authority, description) VALUES ('ROLE_AFFILIATE', 'Afiliado');
INSERT INTO tb_role (authority, description) VALUES ('ROLE_CLIENT', 'Usuário cliente da plataforma');
