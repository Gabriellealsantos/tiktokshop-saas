package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotBlank;

/**
 * Troca de pessoa: substitui a pessoa do frame do vídeo (image 1) pelo avatar (image 2),
 * preservando pose, enquadramento, roupa e cenário do frame.
 */
public record SwapPersonRequestDTO(
        @NotBlank String frameUrl,
        @NotBlank String avatarImageUrl,
        String customPrompt,
        String templateSlug
) {
}
