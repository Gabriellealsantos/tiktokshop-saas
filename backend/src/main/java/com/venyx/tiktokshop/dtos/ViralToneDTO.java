package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.ViralTone;

public record ViralToneDTO(
        String slug,
        String label,
        String description) {
    public ViralToneDTO(ViralTone entity) {
        this(entity.getSlug(), entity.getLabel(), entity.getDescription());
    }
}
