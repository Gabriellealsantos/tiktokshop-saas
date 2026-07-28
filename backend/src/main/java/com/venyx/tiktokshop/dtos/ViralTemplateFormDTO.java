package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotBlank;

/** Payload de criação/edição de template viral (admin). */
public record ViralTemplateFormDTO(
        @NotBlank String slug,
        @NotBlank String title,
        String subtitle,
        String description,
        String thumbnailUrl,
        String previewVideoUrl,
        @NotBlank String scriptInstruction,
        @NotBlank String promptInstruction,
        String category,
        Boolean active
) {
}
