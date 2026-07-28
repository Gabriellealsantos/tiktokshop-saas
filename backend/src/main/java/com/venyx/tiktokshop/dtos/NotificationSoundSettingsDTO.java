package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.NotificationSoundSettings;

import java.time.Instant;

public record NotificationSoundSettingsDTO(
    Long id,
    Boolean enabled,
    String saleSoundKey,
    String announcementSoundKey,
    String systemSoundKey,
    String saleSoundUrl,
    String announcementSoundUrl,
    String systemSoundUrl,
    Instant updatedAt
) {
    public NotificationSoundSettingsDTO(NotificationSoundSettings entity) {
        this(
            entity.getId(),
            entity.isEnabled(),
            entity.getSaleSoundKey(),
            entity.getAnnouncementSoundKey(),
            entity.getSystemSoundKey(),
            entity.getSaleSoundUrl(),
            entity.getAnnouncementSoundUrl(),
            entity.getSystemSoundUrl(),
            entity.getUpdatedAt()
        );
    }
}
