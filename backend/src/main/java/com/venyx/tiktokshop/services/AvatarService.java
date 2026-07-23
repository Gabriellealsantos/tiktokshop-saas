package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.AvatarDTO;
import com.venyx.tiktokshop.dtos.AvatarFromGenerationDTO;
import com.venyx.tiktokshop.dtos.AvatarFromUploadDTO;
import com.venyx.tiktokshop.entities.Avatar;
import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.FlowType;
import com.venyx.tiktokshop.entities.enums.ImageGenerationStatus;
import com.venyx.tiktokshop.repositories.AvatarRepository;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.DuplicateResourceException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AvatarService {

    private static final int MAX_AVATARS_PER_USER = 20;

    private final AvatarRepository repository;
    private final ImageGenerationRepository generationRepository;
    private final StorageService storageService;
    private final AuthService authService;

    public AvatarService(AvatarRepository repository,
                         ImageGenerationRepository generationRepository,
                         StorageService storageService,
                         AuthService authService) {
        this.repository = repository;
        this.generationRepository = generationRepository;
        this.storageService = storageService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public Page<AvatarDTO> findAll(Pageable pageable) {
        return repository.findAllByUser(currentUserId(), pageable).map(AvatarDTO::new);
    }

    @Transactional(readOnly = true)
    public AvatarDTO findById(Long id) {
        return new AvatarDTO(loadOwned(id));
    }

    @Transactional
    public AvatarDTO saveFromGeneration(AvatarFromGenerationDTO dto) {
        User user = authService.authenticated();

        assertGalleryHasRoom(user.getUuid());

        ImageGeneration generation = generationRepository
                .findByIdAndUser_Uuid(dto.generationId(), user.getUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Geração não encontrada: " + dto.generationId()));

        if (generation.getFlowType() != FlowType.AVATAR) {
            throw new BusinessException("Geração não pertence ao fluxo de avatar.");
        }
        if (generation.getStatus() != ImageGenerationStatus.COMPLETED) {
            throw new BusinessException("Somente gerações concluídas podem ser salvas.");
        }
        if (repository.existsByGeneration_Id(generation.getId())) {
            throw new DuplicateResourceException("Esta geração já foi salva como avatar.");
        }

        Avatar avatar = new Avatar();
        avatar.setUser(user);
        avatar.setName(dto.name().trim());
        avatar.setImageUrl(generation.getImageUrl());
        avatar.setGeneration(generation);
        avatar.getConfig().putAll(generation.getConfig());
        avatar.setCreatedAt(Instant.now());

        return new AvatarDTO(repository.save(avatar));
    }

    @Transactional
    public AvatarDTO saveFromUpload(AvatarFromUploadDTO dto) {
        User user = authService.authenticated();

        assertGalleryHasRoom(user.getUuid());

        assertOwnedImage(dto.imageUrl(), user.getUuid());

        Avatar avatar = new Avatar();
        avatar.setUser(user);
        avatar.setName(dto.name().trim());
        avatar.setImageUrl(dto.imageUrl());
        avatar.setCreatedAt(Instant.now());

        return new AvatarDTO(repository.save(avatar));
    }

    @Transactional
    public AvatarDTO rename(Long id, String name) {
        Avatar avatar = loadOwned(id);
        avatar.setName(name.trim());
        return new AvatarDTO(repository.save(avatar));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(loadOwned(id));
    }

    private void assertOwnedImage(String imageUrl, UUID userId) {
        String base = storageService.publicBaseUrl();
        boolean ownAvatar = imageUrl.startsWith(base + "/avatars/" + userId + "/");
        boolean ownReference = imageUrl.startsWith(base + "/references/" + userId + "/");

        if (!ownAvatar && !ownReference) {
            throw new BusinessException("A imagem deve pertencer a você e estar hospedada na plataforma.");
        }
    }

    private Avatar loadOwned(Long id) {
        return repository.findByIdAndUser_Uuid(id, currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Avatar não encontrado: " + id));
    }

    private UUID currentUserId() {
        return authService.authenticated().getUuid();
    }

    private void assertGalleryHasRoom(UUID userId) {
        if (repository.countByUser(userId) >= MAX_AVATARS_PER_USER) {
            throw new BusinessException(
                    "Você atingiu o limite de " + MAX_AVATARS_PER_USER
                            + " avatares. Exclua um avatar para criar outro.");
        }
    }
}
