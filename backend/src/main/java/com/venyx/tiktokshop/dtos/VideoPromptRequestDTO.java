package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Geração do prompt Veo3 (fase 5). Exige o template de vídeo (direção de movimento) e o
 * produto escolhido. {@code finalImageUrl}/{@code avatarImageUrl} são a imagem montada que o
 * usuário levará ao Google Flow junto com o prompt (referência; não alteram o texto gerado).
 */
public record VideoPromptRequestDTO(
        @NotBlank String templateSlug,
        @NotNull Long productId,
        String finalImageUrl,
        String avatarImageUrl
) {
}
