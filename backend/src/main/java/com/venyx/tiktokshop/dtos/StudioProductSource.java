package com.venyx.tiktokshop.dtos;

/**
 * Origem do produto nas requisições do estúdio ("Criar do zero"). Três fontes mutuamente
 * exclusivas: {@code userProductId} (produto próprio do usuário), {@code productId} (vitrine)
 * ou nome livre. Vitrine e produto próprio têm espaços de id independentes, por isso são
 * campos distintos e nunca um id "genérico".
 */
public interface StudioProductSource {
    Long productId();
    Long userProductId();
    String customProductName();
    String customProductDescription();
}
