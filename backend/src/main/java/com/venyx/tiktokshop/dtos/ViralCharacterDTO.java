package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.ViralCharacter;

public record ViralCharacterDTO(
        String slug,
        String name,
        String description,
        String imageUrl) {
    public ViralCharacterDTO(ViralCharacter entity) {
        this(entity.getSlug(), entity.getName(), entity.getDescription(), entity.getImageUrl());
    }
}
