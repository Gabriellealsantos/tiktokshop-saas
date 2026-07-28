package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.StudioPromptConfig;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public record StudioPromptConfigDTO(
        Long id,

        @NotBlank(message = "A instrução do prompt é obrigatória")
        String promptInstruction,

        Instant updatedAt,
        String updatedBy
) {
    public StudioPromptConfigDTO(StudioPromptConfig entity) {
        this(
                entity.getId(),
                entity.getPromptInstruction(),
                entity.getUpdatedAt(),
                entity.getUpdatedBy() != null ? entity.getUpdatedBy().getName() : null
        );
    }
}