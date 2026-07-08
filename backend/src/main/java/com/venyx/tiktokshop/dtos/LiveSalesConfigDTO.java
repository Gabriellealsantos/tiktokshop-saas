package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.LiveSalesConfig;
import com.venyx.tiktokshop.entities.enums.LiveSalesMode;

import java.time.Instant;

public record LiveSalesConfigDTO(
    Long id,
    LiveSalesMode mode,
    Integer intervalSeconds,
    Instant updatedAt
) {
    public LiveSalesConfigDTO(LiveSalesConfig entity) {
        this(entity.getId(), entity.getMode(), entity.getIntervalSeconds(), entity.getUpdatedAt());
    }
}
