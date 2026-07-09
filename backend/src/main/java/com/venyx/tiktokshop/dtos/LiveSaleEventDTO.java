package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.LiveSaleEvent;

import java.math.BigDecimal;
import java.time.Instant;

public record LiveSaleEventDTO(
    Long id,
    Long productId,
    String productName,
    String imageUrl,
    BigDecimal amount,
    BigDecimal commission,
    Instant createdAt
) {
    public LiveSaleEventDTO(LiveSaleEvent entity) {
        this(
            entity.getId(),
            entity.getProduct() != null ? entity.getProduct().getId() : null,
            entity.getProductName(),
            entity.getImageUrl(),
            entity.getAmount(),
            entity.getCommission(),
            entity.getCreatedAt()
        );
    }
}
