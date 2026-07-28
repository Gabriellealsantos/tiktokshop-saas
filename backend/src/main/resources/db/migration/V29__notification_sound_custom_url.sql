ALTER TABLE notification_sound_settings
    ADD COLUMN sale_sound_url VARCHAR(500),
    ADD COLUMN announcement_sound_url VARCHAR(500),
    ADD COLUMN system_sound_url VARCHAR(500);
