package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.StudioPromptConfigDTO;
import com.venyx.tiktokshop.entities.StudioPromptConfig;
import com.venyx.tiktokshop.repositories.StudioPromptConfigRepository;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class StudioPromptConfigService {

    private final StudioPromptConfigRepository repository;
    private final AuthService authService;

    public StudioPromptConfigService(StudioPromptConfigRepository repository,
                                     AuthService authService) {
        this.repository = repository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public StudioPromptConfigDTO get() {
        return new StudioPromptConfigDTO(loadOrThrow());
    }

    @Transactional
    public StudioPromptConfigDTO update(StudioPromptConfigDTO dto) {
        StudioPromptConfig entity = loadOrThrow();
        entity.setPromptInstruction(dto.promptInstruction());
        entity.setUpdatedAt(Instant.now());
        entity.setUpdatedBy(authService.authenticated());
        return new StudioPromptConfigDTO(repository.save(entity));
    }

    private StudioPromptConfig loadOrThrow() {
        return repository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Configuração de prompt do estúdio não encontrada."));
    }
}