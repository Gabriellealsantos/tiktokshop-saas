package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.services.exceptions.BusinessException;

import java.util.Arrays;
import java.util.List;

/**
 * Requisição de geração de imagem: prompt + zero ou mais imagens de referência.
 *
 * <p>A ordem de {@code referenceImageUrls} é preservada e importa para o modelo
 * (ex.: image 1 = frame/base, image 2 = avatar/produto). URLs nulas/vazias são
 * descartadas para não quebrar o provider.
 *
 * <p>{@code matchFirstReferenceAspect} distingue os dois usos do provider. Nos fluxos de
 * CRIAÇÃO (avatar, studio) não existe imagem base e a proporção vem da configuração. Nos
 * fluxos de SWAP a image 1 é a cena que precisa voltar intacta: pedir uma proporção fixa
 * ali faz o modelo recortar ou esticar o frame, o que é alterar o fundo antes mesmo de o
 * prompt entrar em jogo. Nesses casos a proporção é derivada da própria image 1.
 */
public record ImageProviderRequest(String prompt,
                                   List<String> referenceImageUrls,
                                   boolean matchFirstReferenceAspect) {

    public ImageProviderRequest {
        List<String> source = referenceImageUrls == null ? List.of() : referenceImageUrls;
        if (source.stream().anyMatch(url -> url == null || url.isBlank())) {
            throw new BusinessException("Referência de imagem ausente na requisição de geração.");
        }
        referenceImageUrls = List.copyOf(source);
    }

    /** Mantém as chamadas de dois argumentos dos fluxos de criação compilando. */
    public ImageProviderRequest(String prompt, List<String> referenceImageUrls) {
        this(prompt, referenceImageUrls, false);
    }

    /** Conveniência: {@code of(prompt)} sem referências, ou {@code of(prompt, url1, url2, ...)}. */
    public static ImageProviderRequest of(String prompt, String... urls) {
        return new ImageProviderRequest(prompt, toList(urls), false);
    }

    /** Igual a {@link #of}, mas a saída herda a proporção da primeira referência (image 1). */
    public static ImageProviderRequest ofMatchingAspect(String prompt, String... urls) {
        return new ImageProviderRequest(prompt, toList(urls), true);
    }

    private static List<String> toList(String... urls) {
        return urls == null ? List.of() : Arrays.asList(urls);
    }
}
