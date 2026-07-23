package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.SwapClothesRequestDTO;
import com.venyx.tiktokshop.dtos.SwapPersonRequestDTO;
import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.ClothSwapMode;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.GenerationLimitService;
import com.venyx.tiktokshop.services.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import static com.venyx.tiktokshop.entities.enums.FlowType.VIDEO_TEMPLATE;
import static com.venyx.tiktokshop.entities.enums.ImageGenerationStatus.COMPLETED;
import static com.venyx.tiktokshop.entities.enums.ImageGenerationStatus.FAILED;

/**
 * Swaps de imagem do fluxo de extração de movimento (tela /templates): trocar a pessoa
 * do frame pelo avatar e vestir o produto. Cada geração consome a cota VIDEO_TEMPLATE.
 * Espelha {@code AvatarGenerationService.runAndPersist} (provider de imagem + storage + persistência).
 */
@Service
public class VideoTemplateImageService {

    private static final String FRAME_FOLDER = "templates/frames";
    private static final String RESULT_FOLDER = "templates";

    private final ImageGenerationRepository repository;
    private final GenerationLimitService limitService;
    private final ImageProvider imageProvider;
    private final AuthService authService;
    private final StorageService storageService;

    public VideoTemplateImageService(ImageGenerationRepository repository,
                                     GenerationLimitService limitService,
                                     ImageProvider imageProvider,
                                     AuthService authService,
                                     StorageService storageService) {
        this.repository = repository;
        this.limitService = limitService;
        this.imageProvider = imageProvider;
        this.authService = authService;
        this.storageService = storageService;
    }

    /** Sobe o frame capturado no cliente (canvas) para servir de referência aos swaps. */
    public String uploadFrame(MultipartFile file) {
        User user = authService.authenticated();
        return storageService.upload(file, FRAME_FOLDER + "/" + user.getUuid());
    }

    public ImageGeneration swapPerson(SwapPersonRequestDTO req) {
        User user = authService.authenticated();
        limitService.assertCanGenerate(user.getUuid(), VIDEO_TEMPLATE);

        Map<String, Object> config = new LinkedHashMap<>();
        config.put("op", "swap-person");
        config.put("frameUrl", req.frameUrl());
        config.put("avatarImageUrl", req.avatarImageUrl());

        // Ordem das referências: image 1 = frame (cena/pose), image 2 = avatar (pessoa).
        return runAndPersist(user, SwapPromptTemplates.PERSON, config,
                req.frameUrl(), req.avatarImageUrl());
    }

    public ImageGeneration swapClothes(SwapClothesRequestDTO req) {
        User user = authService.authenticated();
        limitService.assertCanGenerate(user.getUuid(), VIDEO_TEMPLATE);

        ClothSwapMode mode = ClothSwapMode.fromValue(req.mode());

        Map<String, Object> config = new LinkedHashMap<>();
        config.put("op", "swap-clothes");
        config.put("mode", mode.name());
        config.put("baseImageUrl", req.baseImageUrl());
        config.put("productImageUrl", req.productImageUrl());

        // Ordem das referências: image 1 = pessoa (base), image 2 = produto.
        return runAndPersist(user, SwapPromptTemplates.clothes(mode), config,
                req.baseImageUrl(), req.productImageUrl());
    }

    private ImageGeneration runAndPersist(User user, String prompt,
                                          Map<String, Object> config, String... references) {
        ImageGeneration job = new ImageGeneration();
        job.setUser(user);
        job.setFlowType(VIDEO_TEMPLATE);
        job.getConfig().putAll(config);
        job.setPrompt(prompt);
        job.setCreatedAt(Instant.now());

        try {
            ImageProviderResult result = imageProvider.generate(ImageProviderRequest.of(prompt, references));
            String folder = RESULT_FOLDER + "/" + user.getUuid();
            job.setImageUrl(storageService.uploadWithRetry(result.content(), result.mimeType(), folder));
            job.setStatus(COMPLETED);
        } catch (Exception e) {
            job.setStatus(FAILED);
            job.setError(e.getMessage());
        }

        return repository.save(job);
    }
}
