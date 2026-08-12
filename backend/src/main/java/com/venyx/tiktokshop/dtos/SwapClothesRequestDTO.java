package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotBlank;

/**
 * Troca de roupa: veste a pessoa da imagem base (image 1) com o produto (image 2).
 * {@code mode} controla a intensidade da troca (look completo / substituir peça / adicionar peça).
 */
public record SwapClothesRequestDTO(
        @NotBlank String baseImageUrl,
        @NotBlank String productImageUrl,
        @NotBlank String mode,
        String productName,
        String productDescription,
        String avatarImageUrl,
        String customPrompt,
        String templateSlug
) {
}
