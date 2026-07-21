package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotBlank;

/**
 * Um roteiro viral. Usado como saída de {@code /scripts} e como entrada
 * (roteiro escolhido) em {@code /prompt}.
 */
public record ViralScriptDTO(
        String id,
        @NotBlank String title,
        String description,
        @NotBlank String quote
) {
}
