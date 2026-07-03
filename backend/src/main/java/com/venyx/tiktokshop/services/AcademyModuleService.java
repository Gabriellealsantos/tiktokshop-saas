package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.AcademyLessonDTO;
import com.venyx.tiktokshop.dtos.AcademyModuleDTO;
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
public class AcademyModuleService {

    private final AcademyModuleRepository repository;
    private final AcademyLessonRepository lessonRepository;

    public AcademyModuleService(AcademyModuleRepository repository, AcademyLessonRepository lessonRepository) {
        this.repository = repository;
        this.lessonRepository = lessonRepository;
    }

    @Transactional(readOnly = true)
    public List<AcademyModuleDTO> findAllWithLessons() {
        return repository.findAllByOrderByOrderIndexAsc().stream()
                .map(module -> new AcademyModuleDTO(module, findLessonDTOs(module.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AcademyModuleDTO> findAllFlat() {
        return repository.findAllByOrderByOrderIndexAsc().stream().map(AcademyModuleDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public AcademyModuleDTO findById(Long id) {
        AcademyModule module = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Módulo não encontrado: " + id));
        return new AcademyModuleDTO(module);
    }

    @Transactional
    public AcademyModuleDTO insert(AcademyModuleDTO dto) {
        AcademyModule entity = new AcademyModule();
        copyDtoToEntity(dto, entity);
        entity = repository.save(entity);
        return new AcademyModuleDTO(entity);
    }

    @Transactional
    public AcademyModuleDTO update(Long id, AcademyModuleDTO dto) {
        try {
            AcademyModule entity = repository.getReferenceById(id);
            copyDtoToEntity(dto, entity);
            entity = repository.save(entity);
            return new AcademyModuleDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Módulo não encontrado: " + id);
        }
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Módulo não encontrado: " + id);
        }
        repository.deleteById(id);
    }

    private List<AcademyLessonDTO> findLessonDTOs(Long moduleId) {
        return lessonRepository.findByModule_IdOrderByOrderIndexAsc(moduleId).stream()
                .map(AcademyLessonDTO::new)
                .toList();
    }

    private void copyDtoToEntity(AcademyModuleDTO dto, AcademyModule entity) {
        if (dto.title() == null || dto.title().isBlank()) {
            throw new BusinessException("Título do módulo é obrigatório.");
        }
        entity.setTitle(dto.title().trim());
        entity.setDescription(dto.description());
        entity.setOrderIndex(dto.orderIndex());
    }
}
