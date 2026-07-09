package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.DailyLimitDTO;
import com.venyx.tiktokshop.entities.DailyLimit;
import com.venyx.tiktokshop.entities.enums.FlowType;
import com.venyx.tiktokshop.repositories.DailyLimitRepository;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class DailyLimitService {

    private final DailyLimitRepository repository;
    private final AuthService authService;

    public DailyLimitService(DailyLimitRepository repository, AuthService authService) {
        this.repository = repository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<DailyLimitDTO> findAll() {
        return repository.findAll().stream().map(DailyLimitDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public DailyLimitDTO findByFlowType(FlowType flowType) {
        return new DailyLimitDTO(loadOrThrow(flowType));
    }

    @Transactional
    public DailyLimitDTO update(FlowType flowType, DailyLimitDTO dto) {
        DailyLimit entity = loadOrThrow(flowType);
        entity.setMaxPerDay(dto.maxPerDay());
        entity.setMaxRegenerations(dto.maxRegenerations());
        entity.setUpdatedAt(Instant.now());
        entity.setUpdatedBy(authService.authenticated());
        return new DailyLimitDTO(repository.save(entity));
    }

    private DailyLimit loadOrThrow(FlowType flowType) {
        return repository.findById(flowType)
                .orElseThrow(() -> new ResourceNotFoundException("Limite não configurado: " + flowType));
    }
}
