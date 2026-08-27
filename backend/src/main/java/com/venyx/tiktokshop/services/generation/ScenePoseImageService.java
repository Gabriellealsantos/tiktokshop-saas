package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.StudioImageRequestDTO;
import com.venyx.tiktokshop.dtos.StudioVideoRequestDTO;
import com.venyx.tiktokshop.entities.*;
import com.venyx.tiktokshop.entities.enums.CreationStatus;
import com.venyx.tiktokshop.entities.enums.FlowType;
import com.venyx.tiktokshop.entities.enums.ImageGenerationStatus;
import com.venyx.tiktokshop.repositories.*;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.GenerationLimitService;
import com.venyx.tiktokshop.services.StorageService;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionSynchronization;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;



@Service
public class ScenePoseImageService {

    private static final String STUDIO_FOLDER = "studio";
    private static final String CUSTOM_PRODUCT_FOLDER = "custom-products";


    private final ObjectMapper objectMapper;
    private final ProductRepository productRepository;
    private final AvatarRepository avatarRepository;
    private final GalleryAvatarRepository galleryAvatarRepository;
    private final CreationSessionRepository sessionRepository;
    private final ImageGenerationRepository generationRepository;
    private final GenerationLimitService limitService;
    private final SceneImagePromptBuilder promptBuilder;
    private final ImageProvider imageProvider;
    private final StorageService storageService;
    private final AuthService authService;
    private final StudioVideoPromptComposer videoComposer;
    private final TextProvider textProvider;
    private final StudioGenerationProcessor processor;
    private final StudioVideoPromptTx videoPromptTx;

    public ScenePoseImageService(ObjectMapper objectMapper,
                                 ProductRepository productRepository,
                                 AvatarRepository avatarRepository,
                                 GalleryAvatarRepository galleryAvatarRepository,
                                 CreationSessionRepository sessionRepository,
                                 ImageGenerationRepository generationRepository,
                                 GenerationLimitService limitService,
                                 SceneImagePromptBuilder promptBuilder,
                                 ImageProvider imageProvider,
                                 StorageService storageService,
                                 AuthService authService,
                                 StudioVideoPromptComposer videoComposer,
                                 TextProvider textProvider,
                                 StudioGenerationProcessor processor,
                                 StudioVideoPromptTx videoPromptTx) {
        this.objectMapper = objectMapper;
        this.productRepository = productRepository;
        this.avatarRepository = avatarRepository;
        this.galleryAvatarRepository = galleryAvatarRepository;
        this.sessionRepository = sessionRepository;
        this.generationRepository = generationRepository;
        this.limitService = limitService;
        this.promptBuilder = promptBuilder;
        this.imageProvider = imageProvider;
        this.storageService = storageService;
        this.authService = authService;
        this.videoComposer = videoComposer;
        this.textProvider = textProvider;
        this.processor = processor;
        this.videoPromptTx = videoPromptTx;
    }

    @Transactional
    public CreationSession generateImage(StudioImageRequestDTO req) {
        User user = authService.authenticated();
        limitService.assertCanGenerate(user.getUuid(), FlowType.STUDIO);

        Product catalogProduct = resolveCatalogProduct(req);
        ProductRef product = resolveProduct(req, catalogProduct);
        String avatarImageUrl = resolveAvatarImageUrl(req, user.getUuid());

        String prompt = promptBuilder.build(product, req);

        CreationSession session = new CreationSession();
        session.setUser(user);
        session.setProduct(catalogProduct);
        session.setFormat(req.format());
        session.setStatus(CreationStatus.GENERATING);
        session.getConfig().putAll(objectMapper.convertValue(req, new TypeReference<Map<String, Object>>() {}));
        session.getConfig().put("avatarImageUrl", avatarImageUrl);
        session.getConfig().put("productName", product.name());
        session.getConfig().put("productDescription", product.description());
        session.getConfig().put("productImageUrl", product.imageUrl());
        session = sessionRepository.save(session);

        ImageGeneration job = new ImageGeneration();
        job.setUser(user);
        job.setFlowType(FlowType.STUDIO);
        job.setStatus(ImageGenerationStatus.PENDING);
        job.getConfig().putAll(session.getConfig());
        job.setPrompt(prompt);
        job.setCreatedAt(Instant.now());
        job.setUpdatedAt(Instant.now());
        job = generationRepository.save(job);

        session.getConfig().put("generationId", job.getId());
        session = sessionRepository.save(session);

        Long sessionId = session.getId();
        Long jobId = job.getId();
        registerAsyncDispatch(sessionId, jobId);

        return session;
    }

    @Transactional(readOnly = true)
    public CreationSession findById(Long id) {
        UUID userId = authService.authenticated().getUuid();
        return sessionRepository.findByIdAndUser_Uuid(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Sessão não encontrada: " + id));
    }

    public CreationSession generateVideoPrompt(StudioVideoRequestDTO req) {
        UUID userId = authService.authenticated().getUuid();

        Map<String, Object> config = videoPromptTx.loadContext(req.sessionId(), userId);

        String videoPrompt = videoComposer.compose(
                (String) config.get("productName"),
                (String) config.get("productDescription"),
                config, req.script(), req.voice());

        TextProviderResult result = textProvider.generate(new TextProviderRequest(videoPrompt, false));

        return videoPromptTx.saveResult(req.sessionId(), userId,
                req.script(), req.voice().name(), result.text().trim());
    }

    private Product resolveCatalogProduct(StudioImageRequestDTO req) {
        if (req.productId() == null) {
            return null;
        }
        return productRepository.findById(req.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + req.productId()));
    }

    private ProductRef resolveProduct(StudioImageRequestDTO req, Product catalogProduct) {
        if (catalogProduct != null) {
            if (catalogProduct.getImageUrl() == null || catalogProduct.getImageUrl().isBlank()) {
                throw new BusinessException("O produto selecionado não possui imagem cadastrada.");
            }
            return new ProductRef(catalogProduct.getName(), catalogProduct.getDescription(),
                    catalogProduct.getImageUrl());
        }

        if (req.customProductName() == null || req.customProductName().isBlank()) {
            throw new BusinessException("Informe o produto do catálogo ou envie o seu próprio produto.");
        }
        assertUploadedIn(req.customProductImageUrl(), CUSTOM_PRODUCT_FOLDER, "A imagem do produto");
        return new ProductRef(req.customProductName().trim(), null, req.customProductImageUrl());
    }

    private String resolveAvatarImageUrl(StudioImageRequestDTO req, UUID userId) {
        if (req.avatarId() != null) {
            return avatarRepository.findByIdAndUser_Uuid(req.avatarId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Avatar não encontrado: " + req.avatarId()))
                    .getImageUrl();
        }
        if (req.galleryAvatarId() != null) {
            return galleryAvatarRepository.findByIdAndActiveTrue(req.galleryAvatarId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Avatar da galeria não encontrado: " + req.galleryAvatarId()))
                    .getImageUrl();
        }
        throw new BusinessException("Informe um avatar seu ou um avatar da galeria.");
    }

    private void assertUploadedIn(String imageUrl, String folder, String label) {
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new BusinessException(label + " é obrigatória.");
        }
        if (!imageUrl.startsWith(storageService.publicBaseUrl() + "/" + folder + "/")) {
            throw new BusinessException(label + " deve ser enviada pela plataforma.");
        }
    }

    private void registerAsyncDispatch(Long sessionId, Long jobId) {
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            processor.process(sessionId, jobId);
                        } catch (TaskRejectedException e) {
                            processor.markRejected(sessionId, jobId);
                        }
                    }
                });
    }
}