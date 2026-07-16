-- Configuração global (singleton) do som das notificações in-app. O dono do SaaS escolhe,
-- por tipo de notificação, qual preset toca no cliente. Guardamos só a chave do preset
-- (os arquivos .mp3 ficam no bundle do frontend). enabled = kill switch global.
CREATE TABLE notification_sound_settings (
    id                      BIGSERIAL PRIMARY KEY,
    enabled                 BOOLEAN NOT NULL DEFAULT TRUE,
    sale_sound_key          VARCHAR(64) NOT NULL DEFAULT 'cash',
    announcement_sound_key  VARCHAR(64) NOT NULL DEFAULT 'ding',
    system_sound_key        VARCHAR(64) NOT NULL DEFAULT 'chime',
    updated_at              TIMESTAMP WITHOUT TIME ZONE
);

-- Linha singleton inicial com os presets padrão.
INSERT INTO notification_sound_settings (enabled, sale_sound_key, announcement_sound_key, system_sound_key, updated_at)
VALUES (TRUE, 'cash', 'ding', 'chime', NOW());
