package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.CreationSession;
import com.venyx.tiktokshop.entities.enums.CreationFormat;
import com.venyx.tiktokshop.entities.enums.CreationStatus;

import java.time.Instant;
import java.util.Map;

public record CreationSessionDTO(
        Long id,
        Long productId,
        CreationFormat format,
        CreationStatus status,
        Map<String, Object> config,
        Instant createdAt,
        Instant updatedAt
) {
    public CreationSessionDTO(CreationSession entity) {
        this(
                entity.getId(),
                entity.getProduct() != null ? entity.getProduct().getId() : null,
                entity.getFormat(),
                entity.getStatus(),
                entity.getConfig(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
