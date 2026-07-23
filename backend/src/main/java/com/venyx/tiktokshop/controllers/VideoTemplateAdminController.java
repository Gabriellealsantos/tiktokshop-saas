package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.VideoTemplateAdminDTO;
import com.venyx.tiktokshop.dtos.VideoTemplateFormDTO;
import com.venyx.tiktokshop.services.VideoTemplateCatalogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Cadastro dinâmico dos templates de vídeo PÚBLICOS (admin) — registrar novos modelos
 * virais sem redeploy, incluindo a direção de prompt (motionInstruction etc.).
 */
@RestController
@RequestMapping("/api/admin/video-templates")
@PreAuthorize("hasRole('ADMIN')")
public class VideoTemplateAdminController {

    private final VideoTemplateCatalogService catalog;

    public VideoTemplateAdminController(VideoTemplateCatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping
    public ResponseEntity<List<VideoTemplateAdminDTO>> list() {
        return ResponseEntity.ok(catalog.listAdmin());
    }

    @PostMapping
    public ResponseEntity<VideoTemplateAdminDTO> create(@Valid @RequestBody VideoTemplateFormDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalog.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VideoTemplateAdminDTO> update(@PathVariable Long id,
                                                        @Valid @RequestBody VideoTemplateFormDTO dto) {
        return ResponseEntity.ok(catalog.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        catalog.delete(id);
        return ResponseEntity.noContent().build();
    }
}