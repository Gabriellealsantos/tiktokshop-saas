package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.PendingJobDTO;
import com.venyx.tiktokshop.dtos.SwapClothesRequestDTO;
import com.venyx.tiktokshop.dtos.SwapPersonRequestDTO;
import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.ClothSwapMode;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.GenerationLimitService;
import com.venyx.tiktokshop.services.StorageService;
import com.venyx.tiktokshop.services.VideoTemplateCatalogService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import static com.venyx.tiktokshop.entities.enums.FlowType.VIDEO_TEMPLATE;
import static com.venyx.tiktokshop.entities.enums.ImageGenerationStatus.PENDING;

/**
 * Swaps de imagem do fluxo de extração de movimento (tela /templates) — agora assíncrono.
 * <p>
 * Os métodos públicos resolvem User, cota e prompt sincronamente, persistem o job como PENDING,
 * e delegam a chamada ao Gemini/storage ao {@link VideoTemplateSwapWorker} via @Async.
 * </p>
 */
@Service
public class VideoTemplateImageService {

    private static final String FRAME_FOLDER = "templates/frames";

    private final ImageGenerationRepository repository;
    private final GenerationLimitService limitService;
    private final AuthService authService;
    private final StorageService storageService;
    private final SwapPromptComposer promptComposer;
    private final VideoTemplateSwapWorker swapWorker;
    private final VideoTemplateCatalogService catalogService;

    public VideoTemplateImageService(ImageGenerationRepository repository,
                                     GenerationLimitService limitService,
                                     AuthService authService,
                                     StorageService storageService,
                                     SwapPromptComposer promptComposer,
                                     VideoTemplateSwapWorker swapWorker,
                                     VideoTemplateCatalogService catalogService) {
        this.repository = repository;
        this.limitService = limitService;
        this.authService = authService;
        this.storageService = storageService;
        this.promptComposer = promptComposer;
        this.swapWorker = swapWorker;
        this.catalogService = catalogService;
    }

    /** Sobe o frame capturado no cliente (canvas) para servir de referência aos swaps. */
    public String uploadFrame(MultipartFile file) {
        User user = authService.authenticated();
        return storageService.upload(file, FRAME_FOLDER + "/" + user.getUuid());
    }

    public PendingJobDTO swapPerson(SwapPersonRequestDTO req) {
        User user = authService.authenticated();
        limitService.assertCanGenerate(user.getUuid(), VIDEO_TEMPLATE);

        Map<String, Object> config = new LinkedHashMap<>();
        config.put("op", "swap-person");
        config.put("frameUrl", req.frameUrl());
        config.put("avatarImageUrl", req.avatarImageUrl());

        StringBuilder builder = new StringBuilder(SwapPromptComposer.PERSON);
        if (StringUtils.hasText(req.templateSlug())) {
            var template = catalogService.requireVisible(req.templateSlug());
            builder.append(promptComposer.personSceneBlock(
                    template.getScenePrompt(), template.getImagePrompt()));
        }
        builder.append(promptComposer.avatarCustomBlock(req.customPrompt()));
        builder.append("\n").append(SwapPromptComposer.PERSON_FINAL_LOCK);

        String basePrompt = builder.toString();

        ImageGeneration job = createPendingJob(user, config, basePrompt);

        // Ordem das referências: image 1 = frame (cena/pose), image 2 = avatar (pessoa).
        swapWorker.runSwapPerson(user, job.getId(), basePrompt,
                req.frameUrl(), req.avatarImageUrl());
        return new PendingJobDTO(job.getId());
    }

    public PendingJobDTO swapClothes(SwapClothesRequestDTO req) {
        User user = authService.authenticated();
        limitService.assertCanGenerate(user.getUuid(), VIDEO_TEMPLATE);

        ClothSwapMode mode = ClothSwapMode.fromValue(req.mode());
        boolean hasAvatar = StringUtils.hasText(req.avatarImageUrl());

        Map<String, Object> config = new LinkedHashMap<>();
        config.put("op", "swap-clothes");
        config.put("mode", mode.name());
        config.put("baseImageUrl", req.baseImageUrl());
        config.put("productImageUrl", req.productImageUrl());
        if (StringUtils.hasText(req.productName())) {
            config.put("productName", req.productName());
        }
        if (StringUtils.hasText(req.productDescription())) {
            config.put("productDescription", req.productDescription());
        }
        if (hasAvatar) {
            config.put("avatarImageUrl", req.avatarImageUrl());
        }

        StringBuilder builder = new StringBuilder(promptComposer.buildClothesPrompt(
                mode, req.productName(), req.productDescription(), hasAvatar));
        if (StringUtils.hasText(req.templateSlug())) {
            var template = catalogService.requireVisible(req.templateSlug());
            builder.append(promptComposer.clothesSceneBlock(
                    mode, template.getScenePrompt(), template.getImagePrompt()));
        }
        builder.append(promptComposer.avatarCustomBlock(req.customPrompt()));

        String prompt = builder.toString();

        ImageGeneration job = createPendingJob(user, config, prompt);

        // Ordem das referências: image 1 = pessoa (base), image 2 = produto. (Opcional image 3 = avatar)
        if (hasAvatar) {
            swapWorker.runSwapClothes(user, job.getId(), prompt,
                    req.baseImageUrl(), req.productImageUrl(), req.avatarImageUrl());
        } else {
            swapWorker.runSwapClothes(user, job.getId(), prompt,
                    req.baseImageUrl(), req.productImageUrl());
        }
        return new PendingJobDTO(job.getId());
    }

    private ImageGeneration createPendingJob(User user, Map<String, Object> config, String prompt) {
        ImageGeneration job = new ImageGeneration();
        job.setUser(user);
        job.setFlowType(VIDEO_TEMPLATE);
        job.getConfig().putAll(config);
        job.setPrompt(prompt);
        job.setStatus(PENDING);
        job.setCreatedAt(Instant.now());
        return repository.save(job);
    }
}
