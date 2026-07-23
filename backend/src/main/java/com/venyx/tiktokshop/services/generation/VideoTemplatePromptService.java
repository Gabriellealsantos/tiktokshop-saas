package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.VideoPromptRequestDTO;
import com.venyx.tiktokshop.dtos.VideoPromptResponseDTO;
import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.VideoTemplate;
import com.venyx.tiktokshop.repositories.ProductRepository;
import com.venyx.tiktokshop.services.VideoTemplateCatalogService;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Fase 5: gera o prompt Veo3 (texto) a partir do template de vídeo + produto, via prompt-engine.
 *
 * <p>Transformação stateless: não persiste nem consome cota (o recurso caro — imagens — é gasto
 * nos swaps do {@link VideoTemplateImageService}). Retorna apenas o texto para o Google Flow.
 */
@Service
public class VideoTemplatePromptService {

    private final VideoTemplateCatalogService catalog;
    private final ProductRepository productRepository;
    private final VideoPromptComposer composer;
    private final TextProvider textProvider;

    public VideoTemplatePromptService(VideoTemplateCatalogService catalog,
                                      ProductRepository productRepository,
                                      VideoPromptComposer composer,
                                      TextProvider textProvider) {
        this.catalog = catalog;
        this.productRepository = productRepository;
        this.composer = composer;
        this.textProvider = textProvider;
    }

    @Transactional(readOnly = true)
    public VideoPromptResponseDTO generate(VideoPromptRequestDTO req) {
        VideoTemplate template = catalog.requireVisible(req.templateSlug());
        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + req.productId()));

        String instruction = composer.compose(template, product);
        TextProviderResult result = textProvider.generate(new TextProviderRequest(instruction, false));

        return new VideoPromptResponseDTO(result.text().trim());
    }
}
