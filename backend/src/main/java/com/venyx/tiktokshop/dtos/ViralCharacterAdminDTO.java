package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.ViralCharacter;

/**
 * Visão administrativa de um personagem viral: inclui {@code id}, {@code sortOrder}
 * e {@code active} (o DTO público expõe apenas slug/name/description/imageUrl).
 */
public record ViralCharacterAdminDTO(
        Long id,
        String slug,
        String name,
        String description,
        String imageUrl,
        String subcategory,
        int sortOrder,
        boolean active
) {
    public ViralCharacterAdminDTO(ViralCharacter entity) {
        this(
                entity.getId(),
                entity.getSlug(),
                entity.getName(),
                entity.getDescription(),
                entity.getImageUrl(),
                entity.getSubcategory(),
                entity.getSortOrder(),
                entity.isActive()
        );
    }
}