package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotBlank;

/** Payload de criação/edição de personagem viral (admin). */
public record ViralCharacterFormDTO(
        @NotBlank String slug,
        @NotBlank String name,
        @NotBlank String description,
        String imageUrl,
        Integer sortOrder,
        Boolean active
) {
}
