package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotBlank;

/** Payload de criação/edição de tom viral (admin). */
public record ViralToneFormDTO(
        @NotBlank String slug,
        @NotBlank String label,
        String description,
        Integer sortOrder,
        Boolean active
) {
}
