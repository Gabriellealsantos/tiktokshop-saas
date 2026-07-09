package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.enums.NotificationAudience;
import com.venyx.tiktokshop.entities.enums.NotificationType;

import java.util.List;
import java.util.UUID;

/**
 * Corpo de criação de notificação pelo admin. Se audience=SELECTED, targetUserIds
 * deve ser não-vazio (os UUIDs viram NotificationTarget).
 */
public record CreateNotificationDTO(
    NotificationType type,
    String title,
    String body,
    String imageUrl,
    String clickUrl,
    NotificationAudience audience,
    List<UUID> targetUserIds
) {
}
