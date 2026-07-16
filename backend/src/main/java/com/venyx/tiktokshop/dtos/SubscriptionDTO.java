package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.UserSubscription;
import com.venyx.tiktokshop.entities.enums.PlanType;
import com.venyx.tiktokshop.entities.enums.SubscriptionStatus;

import java.time.Instant;

public record SubscriptionDTO(
        Long id,
        PlanType planType,
        Instant startedAt,
        Instant expiresAt,
        SubscriptionStatus status
) {
    public SubscriptionDTO(UserSubscription entity) {
        this(
                entity.getId(),
                entity.getPlan().getType(),
                entity.getStartedAt(),
                entity.getExpiresAt(),
                entity.getStatus()
        );
    }
}
