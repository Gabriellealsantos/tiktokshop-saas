package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.AcademyLessonDTO;
import com.venyx.tiktokshop.entities.AcademyLesson;
import com.venyx.tiktokshop.entities.AcademyModule;
import com.venyx.tiktokshop.repositories.AcademyLessonRepository;
import com.venyx.tiktokshop.repositories.AcademyModuleRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AcademyLessonService {

    private final AcademyLessonRepository repository;
    private final AcademyModuleRepository moduleRepository;

    public AcademyLessonService(AcademyLessonRepository repository, AcademyModuleRepository moduleRepository) {
        this.repository = repository;
        this.moduleRepository = moduleRepository;
    }

    @Transactional(readOnly = true)
    public List<AcademyLessonDTO> findByModule(Long moduleId) {
        return repository.findByModule_IdOrderByOrderIndexAsc(moduleId).stream()
                .map(AcademyLessonDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public AcademyLessonDTO findById(Long id) {
        AcademyLesson lesson = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aula não encontrada: " + id));
        return new AcademyLessonDTO(lesson);
    }

    @Transactional
    public AcademyLessonDTO insert(AcademyLessonDTO dto) {
        AcademyLesson entity = new AcademyLesson();
        entity.setModule(resolveModule(dto.moduleId()));
        copyDtoToEntity(dto, entity);
        entity = repository.save(entity);
        return new AcademyLessonDTO(entity);
    }

    @Transactional
    public AcademyLessonDTO update(Long id, AcademyLessonDTO dto) {
        try {
            AcademyLesson entity = repository.getReferenceById(id);
            entity.setModule(resolveModule(dto.moduleId()));
            copyDtoToEntity(dto, entity);
            entity = repository.save(entity);
            return new AcademyLessonDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Aula não encontrada: " + id);
        }
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Aula não encontrada: " + id);
        }
        repository.deleteById(id);
    }

    private AcademyModule resolveModule(Long moduleId) {
        if (moduleId == null) {
            throw new BusinessException("moduleId é obrigatório.");
        }
        return moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Módulo não encontrado: " + moduleId));
    }

    private void copyDtoToEntity(AcademyLessonDTO dto, AcademyLesson entity) {
        if (dto.title() == null || dto.title().isBlank()) {
            throw new BusinessException("Título da aula é obrigatório.");
        }
        entity.setTitle(dto.title().trim());
        entity.setVideoUrl(dto.videoUrl());
        entity.setOrderIndex(dto.orderIndex());
        entity.setDuration(dto.duration());
    }
}
