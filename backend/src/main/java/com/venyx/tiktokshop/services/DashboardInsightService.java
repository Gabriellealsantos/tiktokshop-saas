package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.DashboardInsightDTO;
import com.venyx.tiktokshop.entities.DashboardInsight;
import com.venyx.tiktokshop.repositories.DashboardInsightRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DashboardInsightService {

    private final DashboardInsightRepository repository;

    public DashboardInsightService(DashboardInsightRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<DashboardInsightDTO> findActive(String kind) {
        List<DashboardInsight> entities = (kind == null || kind.isBlank())
                ? repository.findByActiveTrueOrderByOrderIndexAsc()
                : repository.findByKindAndActiveTrueOrderByOrderIndexAsc(kind);
        return entities.stream().map(DashboardInsightDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public List<DashboardInsightDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(DashboardInsightDTO::new)
                .toList();
    }

    @Transactional
    public DashboardInsightDTO insert(DashboardInsightDTO dto) {
        DashboardInsight entity = new DashboardInsight();
        copyDtoToEntity(dto, entity);
        entity = repository.save(entity);
        return new DashboardInsightDTO(entity);
    }

    @Transactional
    public DashboardInsightDTO update(Long id, DashboardInsightDTO dto) {
        try {
            DashboardInsight entity = repository.getReferenceById(id);
            copyDtoToEntity(dto, entity);
            entity = repository.save(entity);
            return new DashboardInsightDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Insight de dashboard não encontrado: " + id);
        }
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Insight de dashboard não encontrado: " + id);
        }
        repository.deleteById(id);
    }

    private void copyDtoToEntity(DashboardInsightDTO dto, DashboardInsight entity) {
        if (dto.kind() == null || dto.kind().isBlank()) {
            throw new BusinessException("Tipo do insight (kind) é obrigatório.");
        }
        if (!DashboardInsight.KIND_CARD.equals(dto.kind()) && !DashboardInsight.KIND_MOMENT_READ.equals(dto.kind())) {
            throw new BusinessException("Tipo de insight inválido: " + dto.kind());
        }
        entity.setKind(dto.kind());
        entity.setTitle(dto.title());
        entity.setContent(dto.content());
        entity.setOrderIndex(dto.orderIndex());
        entity.setActive(dto.active());
    }
}
