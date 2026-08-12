package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotBlank;

/** Payload de criação/edição de template de vídeo público (admin). */
public record VideoTemplateFormDTO(
        @NotBlank String slug,
        @NotBlank String title,
        String category,
        String thumbnailUrl,
        @NotBlank String videoUrl,
        String videoStyle,
        String objective,
        String tone,
        String energy,
        String duration,
        String motionInstruction,
        String imagePrompt,
        String audioMode,
        Integer sortOrder,
        Boolean active
) {
}