package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.Avatar;

import java.time.Instant;

public record AvatarDTO(
        Long id,
        String name,
        String imageUrl,
        Long generationId,
        Instant createdAt,
        String customPrompt
) {
    public AvatarDTO(Avatar entity) {
        this(
                entity.getId(),
                entity.getName(),
                entity.getImageUrl(),
                entity.getGeneration() != null ? entity.getGeneration().getId() : null,
                entity.getCreatedAt(),
                entity.getConfig() != null ? (String) entity.getConfig().get("customPrompt") : null
        );
    }
}
