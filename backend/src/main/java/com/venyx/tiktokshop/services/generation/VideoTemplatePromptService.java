package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.PendingJobDTO;
import com.venyx.tiktokshop.dtos.VideoPromptRequestDTO;
import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.VideoTemplate;
import com.venyx.tiktokshop.repositories.ProductRepository;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.VideoTemplateCatalogService;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Motor de geração de prompts para vídeo (Veo3) — agora assíncrono.
 * <p>
 * O método público resolve User e catálogo sincronamente (thread do Tomcat),
 * retorna imediatamente com um correlationId, e delega o trabalho pesado
 * (chamada ao Gemini) ao {@link VideoTemplatePromptWorker} via @Async.
 * Não consome cota nem persiste job no banco de dados.
 * </p>
 */
@Service
public class VideoTemplatePromptService {

    private final VideoTemplateCatalogService catalog;
    private final ProductRepository productRepository;
    private final AuthService authService;
    private final VideoTemplatePromptWorker worker;

    public VideoTemplatePromptService(VideoTemplateCatalogService catalog,
                                      ProductRepository productRepository,
                                      AuthService authService,
                                      VideoTemplatePromptWorker worker) {
        this.catalog = catalog;
        this.productRepository = productRepository;
        this.authService = authService;
        this.worker = worker;
    }

    /** Passo final — enfileira geração do prompt para o Google Flow (texto, Veo3). */
    public PendingJobDTO generate(VideoPromptRequestDTO req) {
        User user = authService.authenticated();
        VideoTemplate template = catalog.requireVisible(req.templateSlug());
        
        Product product = productRepository.findByIdWithCategory(req.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + req.productId()));

        String correlationId = UUID.randomUUID().toString();
        worker.runPrompt(user, correlationId, template, product);
        
        return new PendingJobDTO(correlationId);
    }
}
