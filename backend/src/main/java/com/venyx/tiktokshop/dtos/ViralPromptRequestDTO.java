package com.venyx.tiktokshop.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ViralPromptRequestDTO(
        @NotBlank String templateSlug,
        @NotBlank String characterSlug,
        @NotBlank String tone,
        @NotNull @Valid ViralScriptDTO script
) {
}
