package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.VideoTemplateSummaryDTO;
import com.venyx.tiktokshop.services.VideoTemplateCatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Catálogo de templates de vídeo do fluxo de extração de movimento (tela /templates).
 * Somente leitura: o usuário vê os templates públicos curados pelo admin. O cadastro
 * (incluindo o script de movimento) é feito no painel admin.
 */
@RestController
@RequestMapping("/api/video-templates")
@PreAuthorize("hasAnyRole('ADMIN', 'AFFILIATE', 'CLIENT')")
public class VideoTemplateController {

    private final VideoTemplateCatalogService catalog;

    public VideoTemplateController(VideoTemplateCatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping
    public ResponseEntity<List<VideoTemplateSummaryDTO>> gallery(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(catalog.listGallery(category));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<VideoTemplateSummaryDTO> template(@PathVariable String slug) {
        return ResponseEntity.ok(catalog.getSummary(slug));
    }
}