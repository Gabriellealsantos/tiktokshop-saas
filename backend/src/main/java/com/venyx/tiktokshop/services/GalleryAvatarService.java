package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.GalleryAvatarDTO;
import com.venyx.tiktokshop.entities.GalleryAvatar;
import com.venyx.tiktokshop.repositories.GalleryAvatarRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GalleryAvatarService {

    private final GalleryAvatarRepository repository;
    private final StorageService storageService;

    public GalleryAvatarService(GalleryAvatarRepository repository, StorageService storageService) {
        this.repository = repository;
        this.storageService = storageService;
    }

    @Transactional(readOnly = true)
    public List<GalleryAvatarDTO> findGallery(String gender, String type) {
        String genderParam = (gender == null || gender.isBlank()) ? null : gender;
        String typeParam = (type == null || type.isBlank()) ? null : type;
        return repository.findGallery(genderParam, typeParam)
                .stream()
                .map(GalleryAvatarDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GalleryAvatarDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(GalleryAvatarDTO::new)
                .toList();
    }

    @Transactional
    public GalleryAvatarDTO insert(GalleryAvatarDTO dto) {
        GalleryAvatar entity = new GalleryAvatar();
        copyDtoToEntity(dto, entity);
        entity = repository.save(entity);
        return new GalleryAvatarDTO(entity);
    }

    @Transactional
    public GalleryAvatarDTO update(Long id, GalleryAvatarDTO dto) {
        try {
            GalleryAvatar entity = repository.getReferenceById(id);
            copyDtoToEntity(dto, entity);
            entity = repository.save(entity);
            return new GalleryAvatarDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Avatar da galeria não encontrado: " + id);
        }
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Avatar da galeria não encontrado: " + id);
        }
        repository.deleteById(id);
    }

    private void copyDtoToEntity(GalleryAvatarDTO dto, GalleryAvatar entity) {
        if (dto.name() == null || dto.name().isBlank()) {
            throw new BusinessException("Nome do avatar é obrigatório.");
        }
        if (dto.imageUrl() == null || dto.imageUrl().isBlank()) {
            throw new BusinessException("URL da imagem é obrigatória.");
        }

        if (!dto.imageUrl().startsWith(storageService.publicBaseUrl() + "/")) {
            throw new BusinessException("URL da imagem fora do storage permitido.");
        }
        
        entity.setName(dto.name().trim());
        entity.setGender(dto.gender());
        entity.setType(dto.type());
        entity.setImageUrl(dto.imageUrl());
        entity.setOrderIndex(dto.orderIndex());
    }
}
