package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.AvatarConfigDTO;
import com.venyx.tiktokshop.dtos.AvatarFromPhotoRequestDTO;
import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.ClothingMode;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.GenerationLimitService;
import com.venyx.tiktokshop.services.StorageService;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.venyx.tiktokshop.entities.enums.FlowType.AVATAR;
import static com.venyx.tiktokshop.entities.enums.ImageGenerationStatus.COMPLETED;
import static com.venyx.tiktokshop.entities.enums.ImageGenerationStatus.FAILED;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;


@Service
public class AvatarGenerationService {

    private static final String AVATAR_FOLDER = "avatars";

    private static final String REFERENCE_FOLDER = "references";

    private final ObjectMapper objectMapper;
    private final ImageGenerationRepository repository;
    private final GenerationLimitService limitService;
    private final AvatarPromptBuilder promptBuilder;
    private final ImageProvider imageProvider;
    private final AuthService authService;
    private final StorageService storageService;
    private final AvatarPhotoPromptBuilder photoPromptBuilder;

    public AvatarGenerationService(ImageGenerationRepository repository,
                                   GenerationLimitService limitService,
                                   AvatarPromptBuilder promptBuilder,
                                   ImageProvider imageProvider,
                                   AuthService authService,
                                   StorageService storageService,
                                   ObjectMapper objectMapper,
                                   AvatarPhotoPromptBuilder photoPromptBuilder) {
        this.repository = repository;
        this.limitService = limitService;
        this.promptBuilder = promptBuilder;
        this.imageProvider = imageProvider;
        this.authService = authService;
        this.storageService = storageService;
        this.objectMapper = objectMapper;
        this.photoPromptBuilder = photoPromptBuilder;
    }

    public ImageGeneration generate(AvatarConfigDTO config, String referenceImageUrl) {
        User user = authService.authenticated();
        limitService.assertCanGenerate(user.getUuid(), AVATAR);
        return runAndPersist(user, config, null, referenceImageUrl);
    }

    public ImageGeneration regenerate(Long parentId, String referenceImageUrl) {
        User user = authService.authenticated();

        ImageGeneration parent = repository.findByIdAndUser_Uuid(parentId, user.getUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Geração não encontrada: " + parentId));

        if (parent.getParent() != null) {
            throw new BusinessException("Não é possível corrigir uma correção.");
        }
        if (parent.getFlowType() != AVATAR) {
            throw new BusinessException("Geração não pertence ao fluxo de avatar.");
        }
        if ("PHOTO".equals(parent.getConfig().get("source"))) {
            throw new BusinessException("Correção não disponível para avatares criados a partir de foto.");
        }

        limitService.assertCanRegenerate(parent);

        AvatarConfigDTO config = objectMapper.convertValue(parent.getConfig(), AvatarConfigDTO.class);
        return runAndPersist(user, config, parent, referenceImageUrl);
    }

    @Transactional(readOnly = true)
    public ImageGeneration findById(Long id) {
        UUID userId = authService.authenticated().getUuid();
        return repository.findByIdAndUser_Uuid(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Geração não encontrada: " + id));
    }

    private ImageGeneration runAndPersist(User user, AvatarConfigDTO config,
                                          ImageGeneration parent, String referenceImageUrl) {
        String prompt = promptBuilder.build(config);

        ImageGeneration job = new ImageGeneration();
        job.setUser(user);
        job.setFlowType(AVATAR);
        job.setParent(parent);
        job.getConfig().putAll(objectMapper.convertValue(config, new TypeReference<Map<String, Object>>() {}));
        job.setPrompt(prompt);
        job.setCreatedAt(Instant.now());

        try {
            ImageProviderResult result = imageProvider.generate(
                    ImageProviderRequest.of(prompt, referenceImageUrl));

            String folder = AVATAR_FOLDER + "/" + user.getUuid();
            job.setImageUrl(storageService.uploadWithRetry(result.content(), result.mimeType(), folder));
            job.setStatus(COMPLETED);
        } catch (Exception e) {
            job.setStatus(FAILED);
            job.setError(e.getMessage());
        }

        return repository.save(job);
    }


    @Transactional
    public ImageGeneration generateFromPhoto(AvatarFromPhotoRequestDTO req) {
        User user = authService.authenticated();
        limitService.assertCanGenerate(user.getUuid(), AVATAR);

        assertOwnedReference(req.photoUrl(), user.getUuid(), "A foto");

        List<String> references = new ArrayList<>();
        references.add(req.photoUrl());

        if (req.clothingMode() == ClothingMode.UPLOAD) {
            if (req.clothingPart() == null) {
                throw new BusinessException("Informe o tipo da peça enviada.");
            }
            assertOwnedReference(req.clothingImageUrl(), user.getUuid(), "A imagem da roupa");
            references.add(req.clothingImageUrl());
        }

        String prompt = photoPromptBuilder.build(req);

        ImageGeneration job = new ImageGeneration();
        job.setUser(user);
        job.setFlowType(AVATAR);
        job.getConfig().putAll(objectMapper.convertValue(req, new TypeReference<Map<String, Object>>() {}));
        job.getConfig().put("source", "PHOTO");
        job.setPrompt(prompt);
        job.setCreatedAt(Instant.now());

        try {
            ImageProviderResult result = imageProvider.generate(new ImageProviderRequest(prompt, references));

            String folder = AVATAR_FOLDER + "/" + user.getUuid();
            job.setImageUrl(storageService.uploadWithRetry(result.content(), result.mimeType(), folder));
            job.setStatus(COMPLETED);
        } catch (Exception e) {
            job.setStatus(FAILED);
            job.setError(e.getMessage());
        }

        return repository.save(job);
    }

    private void assertOwnedReference(String imageUrl, UUID userId, String label) {
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new BusinessException(label + " é obrigatória.");
        }
        String expected = storageService.publicBaseUrl() + "/" + REFERENCE_FOLDER + "/" + userId + "/";
        if (!imageUrl.startsWith(expected)) {
            throw new BusinessException(label + " deve ser enviada pela plataforma.");
        }
    }
}
