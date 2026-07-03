package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.UserProduct;

import java.time.Instant;

public record UserProductDTO(
    Long id,
    String name,
    String description,
    String imageUrl,
    Instant createdAt
) {
    public UserProductDTO(UserProduct entity) {
        this(
            entity.getId(),
            entity.getName(),
            entity.getDescription(),
            entity.getImageUrl(),
            entity.getCreatedAt()
        );
    }
}
