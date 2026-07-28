package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.StudioPromptConfigDTO;
import com.venyx.tiktokshop.services.generation.StudioPromptConfigService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/studio/prompt-config")
@PreAuthorize("hasRole('ADMIN')")
public class StudioPromptConfigController {

    private final StudioPromptConfigService service;

    public StudioPromptConfigController(StudioPromptConfigService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<StudioPromptConfigDTO> get() {
        return ResponseEntity.ok(service.get());
    }

    @PutMapping
    public ResponseEntity<StudioPromptConfigDTO> update(@Valid @RequestBody StudioPromptConfigDTO dto) {
        return ResponseEntity.ok(service.update(dto));
    }
}
