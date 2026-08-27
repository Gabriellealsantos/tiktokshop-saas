package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.UserProductDTO;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.UserProduct;
import com.venyx.tiktokshop.repositories.UserProductRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Produtos próprios cadastrados pelo usuário ("Usar meu próprio produto"),
 * distintos da vitrine curada em ProductService. Ownership sempre validado
 * via User.uuid (proteção contra IDOR).
 */
@Service
public class UserProductService {

    private final UserProductRepository repository;

    public UserProductService(UserProductRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<UserProductDTO> findAllForUser(UUID userId) {
        return repository.findByUser_Uuid(userId).stream().map(UserProductDTO::new).toList();
    }

    /** Produto próprio por id, sempre escopado ao dono — o fluxo de geração recupera por aqui. */
    @Transactional(readOnly = true)
    public UserProductDTO findByIdForUser(UUID userId, Long id) {
        return repository.findByIdAndUser_Uuid(id, userId)
                .map(UserProductDTO::new)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + id));
    }

    @Transactional
    public UserProductDTO insert(User user, UserProductDTO dto) {
        UserProduct entity = new UserProduct();
        entity.setUser(user);
        copyDtoToEntity(dto, entity);
        entity = repository.save(entity);
        return new UserProductDTO(entity);
    }

    @Transactional
    public UserProductDTO update(User user, Long id, UserProductDTO dto) {
        UserProduct entity = repository.findByIdAndUser_Uuid(id, user.getUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + id));
        copyDtoToEntity(dto, entity);
        entity = repository.save(entity);
        return new UserProductDTO(entity);
    }

    @Transactional
    public void delete(User user, Long id) {
        UserProduct entity = repository.findByIdAndUser_Uuid(id, user.getUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + id));
        repository.delete(entity);
    }

    private void copyDtoToEntity(UserProductDTO dto, UserProduct entity) {
        if (dto.name() == null || dto.name().isBlank()) {
            throw new BusinessException("Nome do produto é obrigatório.");
        }
        if (dto.imageUrl() == null || dto.imageUrl().isBlank()) {
            throw new BusinessException("A imagem do produto é obrigatória.");
        }
        entity.setName(dto.name().trim());
        entity.setDescription(dto.description());
        entity.setImageUrl(dto.imageUrl());
    }
}
