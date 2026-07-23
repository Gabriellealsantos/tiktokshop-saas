package com.venyx.tiktokshop.services.generation;

import java.util.Arrays;
import java.util.List;

/**
 * Requisição de geração de imagem: prompt + zero ou mais imagens de referência.
 *
 * <p>A ordem de {@code referenceImageUrls} é preservada e importa para o modelo
 * (ex.: image 1 = frame/base, image 2 = avatar/produto). URLs nulas/vazias são
 * descartadas para não quebrar o provider.
 */
public record ImageProviderRequest(String prompt, List<String> referenceImageUrls) {

    public ImageProviderRequest {
        referenceImageUrls = referenceImageUrls == null ? List.of()
                : referenceImageUrls.stream()
                    .filter(url -> url != null && !url.isBlank())
                    .toList();
    }

    /** Conveniência: {@code of(prompt)} sem referências, ou {@code of(prompt, url1, url2, ...)}. */
    public static ImageProviderRequest of(String prompt, String... urls) {
        return new ImageProviderRequest(prompt, urls == null ? List.of() : Arrays.asList(urls));
    }
}
