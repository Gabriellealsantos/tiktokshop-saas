package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotBlank;

/**
 * Geração do prompt Veo3 (fase 5). Exige o template de vídeo (direção de movimento); o produto
 * é opcional e pode vir de duas fontes mutuamente exclusivas: {@code productId} (vitrine) ou
 * {@code userProductId} (produto próprio cadastrado pelo usuário). Sem nenhum dos dois é o
 * fluxo "manter look atual" — vídeo sem produto. {@code finalImageUrl}/{@code avatarImageUrl}
 * são a imagem montada que o usuário levará ao Google Flow junto com o prompt (referência;
 * não alteram o texto gerado).
 */
public record VideoPromptRequestDTO(
        @NotBlank String templateSlug,
        Long productId,
        Long userProductId,
        String finalImageUrl,
        String avatarImageUrl
) {
}
