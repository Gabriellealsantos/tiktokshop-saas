package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.GenerationJobDTO;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.GenerationJobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Polling do resultado de uma geração assíncrona (Estúdio, Avatar, Trend Boost,
 * Ferramentas, TokEditor). Os endpoints que submetem o job pertencem a cada módulo;
 * este é o ponto único de consulta, como já documentado em ARQUITETURA.md.
 */
@RestController
@RequestMapping("/api/generations")
public class GenerationController {

    private final GenerationJobService generationJobService;
    private final AuthService authService;

    public GenerationController(GenerationJobService generationJobService, AuthService authService) {
        this.generationJobService = generationJobService;
        this.authService = authService;
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<GenerationJobDTO> findById(@PathVariable Long jobId) {
        User user = authService.authenticated();
        return ResponseEntity.ok(generationJobService.findByIdForUser(jobId, user.getId()));
    }
}
