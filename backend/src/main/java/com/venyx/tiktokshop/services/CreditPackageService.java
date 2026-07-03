package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.CreditPackageDTO;
import com.venyx.tiktokshop.entities.CreditPackage;
import com.venyx.tiktokshop.repositories.CreditPackageRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CreditPackageService {

    private final CreditPackageRepository repository;

    public CreditPackageService(CreditPackageRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<CreditPackageDTO> findActive() {
        return repository.findByActiveTrueOrderByOrderIndexAsc()
                .stream()
                .map(CreditPackageDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CreditPackageDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(CreditPackageDTO::new)
                .toList();
    }

    @Transactional
    public CreditPackageDTO insert(CreditPackageDTO dto) {
        CreditPackage entity = new CreditPackage();
        copyDtoToEntity(dto, entity);
        entity = repository.save(entity);
        return new CreditPackageDTO(entity);
    }

    @Transactional
    public CreditPackageDTO update(Long id, CreditPackageDTO dto) {
        try {
            CreditPackage entity = repository.getReferenceById(id);
            copyDtoToEntity(dto, entity);
            entity = repository.save(entity);
            return new CreditPackageDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Pacote de créditos não encontrado: " + id);
        }
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Pacote de créditos não encontrado: " + id);
        }
        repository.deleteById(id);
    }

    private void copyDtoToEntity(CreditPackageDTO dto, CreditPackage entity) {
        if (dto.name() == null || dto.name().isBlank()) {
            throw new BusinessException("Nome do pacote é obrigatório.");
        }
        if (dto.credits() == null || dto.credits() <= 0) {
            throw new BusinessException("Quantidade de créditos deve ser positiva.");
        }
        if (dto.price() == null || dto.price().signum() < 0) {
            throw new BusinessException("Preço inválido.");
        }
        entity.setName(dto.name().trim());
        entity.setCredits(dto.credits());
        entity.setBonusPct(dto.bonusPct() != null ? dto.bonusPct() : 0);
        entity.setPrice(dto.price());
        entity.setBadge(dto.badge());
        entity.setActive(dto.active());
        entity.setOrderIndex(dto.orderIndex());
    }
}
