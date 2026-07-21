package com.venyx.tiktokshop.services.generation;

/**
 * Abstração de geração de <b>texto</b> por LLM, análoga a {@link ImageProvider}.
 * Usada pelo fluxo viral para gerar roteiros e o prompt final do vídeo.
 */
public interface TextProvider {
    TextProviderResult generate(TextProviderRequest request);
}
