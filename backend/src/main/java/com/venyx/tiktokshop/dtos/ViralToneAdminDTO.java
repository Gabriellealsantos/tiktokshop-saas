package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.ViralTone;

/**
 * Visão administrativa de um tom viral: inclui {@code id}, {@code sortOrder} e
 * {@code active} (o DTO público expõe apenas slug/label/description).
 */
public record ViralToneAdminDTO(
        Long id,
        String slug,
        String label,
        String description,
        int sortOrder,
        boolean active
) {
    public ViralToneAdminDTO(ViralTone entity) {
        this(
                entity.getId(),
                entity.getSlug(),
                entity.getLabel(),
                entity.getDescription(),
                entity.getSortOrder(),
                entity.isActive()
        );
    }
}