package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.NotificationScheduleDTO;
import com.venyx.tiktokshop.entities.NotificationSchedule;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.NotificationAudience;
import com.venyx.tiktokshop.entities.enums.NotificationType;
import com.venyx.tiktokshop.repositories.NotificationScheduleRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * CRUD das campanhas recorrentes de notificação. O disparo em si é do NotificationScheduler.
 */
@Service
public class NotificationScheduleService {

    private final NotificationScheduleRepository repository;

    public NotificationScheduleService(NotificationScheduleRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<NotificationScheduleDTO> list() {
        return repository.findAll().stream().map(NotificationScheduleDTO::new).toList();
    }

    @Transactional
    public NotificationScheduleDTO create(NotificationScheduleDTO dto, User admin) {
        NotificationSchedule entity = new NotificationSchedule();
        copyDtoToEntity(dto, entity);
        entity.setCreatedBy(admin);
        return new NotificationScheduleDTO(repository.save(entity));
    }

    @Transactional
    public NotificationScheduleDTO update(Long id, NotificationScheduleDTO dto) {
        NotificationSchedule entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campanha não encontrada: " + id));
        copyDtoToEntity(dto, entity);
        return new NotificationScheduleDTO(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Campanha não encontrada: " + id);
        }
        repository.deleteById(id);
    }

    private void copyDtoToEntity(NotificationScheduleDTO dto, NotificationSchedule entity) {
        if (dto.title() == null || dto.title().isBlank()) {
            throw new BusinessException("Título da campanha é obrigatório.");
        }
        if (dto.intervalSeconds() == null || dto.intervalSeconds() <= 0) {
            throw new BusinessException("Intervalo (intervalSeconds) deve ser maior que zero.");
        }
        entity.setTitle(dto.title().trim());
        entity.setBody(dto.body());
        entity.setImageUrl(dto.imageUrl());
        entity.setClickUrl(dto.clickUrl());
        entity.setAudience(dto.audience() != null ? dto.audience() : NotificationAudience.ALL);
        entity.setType(dto.type() != null ? dto.type() : NotificationType.ANNOUNCEMENT);
        entity.setIntervalSeconds(dto.intervalSeconds());
        entity.setActive(dto.active() == null || dto.active());
    }
}
