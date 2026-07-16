-- Preferência de som por usuário: permite silenciar as notificações in-app sem afetar
-- o kill switch global do dono. Default TRUE = mantém o comportamento atual (todos ouvem).
ALTER TABLE tb_user
    ADD COLUMN notification_sound_enabled BOOLEAN NOT NULL DEFAULT TRUE;
