package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.PendingJobDTO;
import com.venyx.tiktokshop.dtos.VideoPromptRequestDTO;
import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.UserProduct;
import com.venyx.tiktokshop.entities.VideoTemplate;
import com.venyx.tiktokshop.repositories.ProductRepository;
import com.venyx.tiktokshop.repositories.UserProductRepository;
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
    private final UserProductRepository userProductRepository;
    private final AuthService authService;
    private final VideoTemplatePromptWorker worker;

    public VideoTemplatePromptService(VideoTemplateCatalogService catalog,
                                      ProductRepository productRepository,
                                      UserProductRepository userProductRepository,
                                      AuthService authService,
                                      VideoTemplatePromptWorker worker) {
        this.catalog = catalog;
        this.productRepository = productRepository;
        this.userProductRepository = userProductRepository;
        this.authService = authService;
        this.worker = worker;
    }

    /** Passo final — enfileira geração do prompt para o Google Flow (texto, Veo3). */
    public PendingJobDTO generate(VideoPromptRequestDTO req) {
        User user = authService.authenticated();
        VideoTemplate template = catalog.requireVisible(req.templateSlug());

        ProductBrief product = resolveProduct(user, req);

        String correlationId = UUID.randomUUID().toString();
        worker.runPrompt(user, correlationId, template, product);

        return new PendingJobDTO(correlationId);
    }

    /**
     * Produto da vitrine, produto próprio do usuário, ou nenhum. "Nenhum" é caso legítimo:
     * em "manter look atual" o usuário só troca a pessoa e gera o prompt sem vestir produto.
     * O produto próprio é sempre resolvido pelo dono (proteção contra IDOR).
     */
    private ProductBrief resolveProduct(User user, VideoPromptRequestDTO req) {
        if (req.userProductId() != null) {
            UserProduct owned = userProductRepository
                    .findByIdAndUser_Uuid(req.userProductId(), user.getUuid())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Produto não encontrado: " + req.userProductId()));
            return ProductBrief.of(owned);
        }
        if (req.productId() != null) {
            Product product = productRepository.findByIdWithCategory(req.productId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Produto não encontrado: " + req.productId()));
            return ProductBrief.of(product);
        }
        return ProductBrief.EMPTY;
    }
}
