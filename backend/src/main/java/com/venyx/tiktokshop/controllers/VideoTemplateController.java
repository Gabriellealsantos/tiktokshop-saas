package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.VideoTemplateSummaryDTO;
import com.venyx.tiktokshop.services.VideoTemplateCatalogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Catálogo de templates de vídeo do fluxo de extração de movimento (tela /templates).
 * O usuário vê os públicos (curados pelo admin) + os privados dele (upload manual).
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

    /** Upload manual: cria um template PRIVADO visível só para o usuário logado. */
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<VideoTemplateSummaryDTO> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalog.uploadManual(file));
    }
}