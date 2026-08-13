package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.LiveSalesConfig;
import com.venyx.tiktokshop.entities.enums.LiveSalesMode;
import com.venyx.tiktokshop.entities.enums.LiveSalesSource;
import com.venyx.tiktokshop.entities.Product;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

public record LiveSalesConfigDTO(
    Long id,
    LiveSalesMode mode,
    Integer intervalSeconds,
    Boolean randomInterval,
    Integer intervalMinSeconds,
    Integer intervalMaxSeconds,
    LiveSalesSource sourceType,
    Long categoryId,
    List<Long> adminProductIds,
    Instant updatedAt
) {
    public LiveSalesConfigDTO(LiveSalesConfig entity) {
        this(
            entity.getId(),
            entity.getMode(),
            entity.getIntervalSeconds(),
            entity.isRandomInterval(),
            entity.getIntervalMinSeconds(),
            entity.getIntervalMaxSeconds(),
            entity.getSourceType(),
            entity.getCategoryId(),
            entity.getAdminProducts() != null ? entity.getAdminProducts().stream().map(Product::getId).collect(Collectors.toList()) : null,
            entity.getUpdatedAt()
        );
    }
}
