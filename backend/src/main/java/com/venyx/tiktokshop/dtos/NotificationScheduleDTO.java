package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.NotificationSchedule;
import com.venyx.tiktokshop.entities.enums.NotificationAudience;
import com.venyx.tiktokshop.entities.enums.NotificationType;

import java.time.Instant;

public record NotificationScheduleDTO(
    Long id,
    String title,
    String body,
    String imageUrl,
    String clickUrl,
    NotificationAudience audience,
    NotificationType type,
    Integer intervalSeconds,
    Boolean active,
    Instant lastFiredAt
) {
    public NotificationScheduleDTO(NotificationSchedule e) {
        this(
            e.getId(),
            e.getTitle(),
            e.getBody(),
            e.getImageUrl(),
            e.getClickUrl(),
            e.getAudience(),
            e.getType(),
            e.getIntervalSeconds(),
            e.isActive(),
            e.getLastFiredAt()
        );
    }
}
