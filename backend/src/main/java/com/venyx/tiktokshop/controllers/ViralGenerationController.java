package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.*;
import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.services.GenerationLimitService;
import com.venyx.tiktokshop.services.ViralCatalogService;
import com.venyx.tiktokshop.services.generation.ViralGenerationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.venyx.tiktokshop.entities.enums.FlowType.VIRAL_MODEL;

/**
 * Fluxo viral (Novelinha Viral / Objetos Falantes). Catálogo + 2 passos de
 * geração de texto. Cota diária própria (VIRAL_MODEL), separada do Avatar.
 */
@RestController
@RequestMapping("/api/viral")
public class ViralGenerationController {

    private final ViralGenerationService service;
    private final ViralCatalogService catalog;
    private final GenerationLimitService limitService;

    public ViralGenerationController(ViralGenerationService service,
                                     ViralCatalogService catalog,
                                     GenerationLimitService limitService) {
        this.service = service;
        this.catalog = catalog;
        this.limitService = limitService;
    }

    @GetMapping("/templates")
    @PreAuthorize("hasAnyRole('ADMIN', 'AFFILIATE', 'CLIENT')")
    public ResponseEntity<List<ViralTemplateSummaryDTO>> templates() {
        return ResponseEntity.ok(catalog.listTemplates());
    }

    @GetMapping("/templates/{slug}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AFFILIATE', 'CLIENT')")
    public ResponseEntity<ViralTemplateDetailDTO> template(@PathVariable String slug) {
        return ResponseEntity.ok(catalog.getTemplateDetail(slug));
    }

    @PostMapping("/scripts")
    @PreAuthorize("hasAnyRole('ADMIN', 'AFFILIATE', 'CLIENT')")
    public ResponseEntity<ViralScriptsResponseDTO> scripts(@Valid @RequestBody ViralScriptsRequestDTO dto) {
        return ResponseEntity.ok(new ViralScriptsResponseDTO(service.generateScripts(dto)));
    }

    @PostMapping("/prompt")
    @PreAuthorize("hasAnyRole('ADMIN', 'AFFILIATE', 'CLIENT')")
    public ResponseEntity<ImageGenerationDTO> prompt(@Valid @RequestBody ViralPromptRequestDTO dto) {
        ImageGeneration job = service.generatePrompt(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ImageGenerationDTO(job));
    }

    @GetMapping("/usage")
    @PreAuthorize("hasAnyRole('ADMIN', 'AFFILIATE', 'CLIENT')")
    public ResponseEntity<DailyUsageDTO> usage() {
        return ResponseEntity.ok(limitService.usageToday(VIRAL_MODEL));
    }
}
