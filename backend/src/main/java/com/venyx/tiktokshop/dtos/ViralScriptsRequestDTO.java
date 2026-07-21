package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotBlank;

public record ViralScriptsRequestDTO(
        @NotBlank String templateSlug,
        @NotBlank String characterSlug,
        @NotBlank String tone
) {
}
