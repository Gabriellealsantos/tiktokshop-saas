package com.venyx.tiktokshop.dtos;

/**
 * Preferência de som por usuário: permite silenciar as notificações in-app sem
 * afetar o kill switch global do dono ({@link NotificationSoundSettingsDTO#enabled()}).
 */
public record NotificationPreferenceDTO(
    Boolean soundEnabled
) {
}
