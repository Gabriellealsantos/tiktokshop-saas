package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.ImageGenerationDTO;
import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Fallback de polling para gerações assíncronas: se o WebSocket desconectar,
 * o frontend pode consultar o status do job por HTTP.
 */
@RestController
@RequestMapping("/api/generations")
@PreAuthorize("hasAnyRole('ADMIN', 'AFFILIATE', 'CLIENT')")
public class GenerationStatusController {

    private final ImageGenerationRepository repository;
    private final AuthService authService;

    public GenerationStatusController(ImageGenerationRepository repository,
                                      AuthService authService) {
        this.repository = repository;
        this.authService = authService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImageGenerationDTO> status(@PathVariable Long id) {
        ImageGeneration job = repository.findByIdAndUser_Uuid(id, authService.authenticated().getUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Geração não encontrada: " + id));
        return ResponseEntity.ok(new ImageGenerationDTO(job));
    }
}
