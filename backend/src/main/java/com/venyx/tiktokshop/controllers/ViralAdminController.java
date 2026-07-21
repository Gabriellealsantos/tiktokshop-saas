package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.*;
import com.venyx.tiktokshop.services.ViralCatalogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Cadastro dinâmico do fluxo viral (admin): templates, personagens e tons —
 * permite registrar novas "novelinhas" sem redeploy, editando inclusive o
 * corpo ".md" das instruções (scriptInstruction / promptInstruction).
 */
@RestController
@RequestMapping("/api/admin/viral")
@PreAuthorize("hasRole('ADMIN')")
public class ViralAdminController {

    private final ViralCatalogService catalog;

    public ViralAdminController(ViralCatalogService catalog) {
        this.catalog = catalog;
    }

    // -------------------------------------------------------------- templates

    @GetMapping("/templates")
    public ResponseEntity<List<ViralTemplateAdminDTO>> templates() {
        return ResponseEntity.ok(catalog.listTemplatesAdmin());
    }

    @PostMapping("/templates")
    public ResponseEntity<ViralTemplateAdminDTO> createTemplate(@Valid @RequestBody ViralTemplateFormDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalog.createTemplate(dto));
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<ViralTemplateAdminDTO> updateTemplate(@PathVariable Long id,
                                                               @Valid @RequestBody ViralTemplateFormDTO dto) {
        return ResponseEntity.ok(catalog.updateTemplate(id, dto));
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        catalog.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------------------------------------- characters

    @GetMapping("/templates/{templateId}/characters")
    public ResponseEntity<List<ViralCharacterAdminDTO>> characters(@PathVariable Long templateId) {
        return ResponseEntity.ok(catalog.listCharactersAdmin(templateId));
    }

    @PostMapping("/templates/{templateId}/characters")
    public ResponseEntity<ViralCharacterAdminDTO> addCharacter(@PathVariable Long templateId,
                                                              @Valid @RequestBody ViralCharacterFormDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalog.addCharacter(templateId, dto));
    }

    @PutMapping("/characters/{id}")
    public ResponseEntity<ViralCharacterAdminDTO> updateCharacter(@PathVariable Long id,
                                                                 @Valid @RequestBody ViralCharacterFormDTO dto) {
        return ResponseEntity.ok(catalog.updateCharacter(id, dto));
    }

    @DeleteMapping("/characters/{id}")
    public ResponseEntity<Void> deleteCharacter(@PathVariable Long id) {
        catalog.deleteCharacter(id);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------------------------------------------ tones

    @GetMapping("/tones")
    public ResponseEntity<List<ViralToneAdminDTO>> tones() {
        return ResponseEntity.ok(catalog.listTonesAdmin());
    }

    @PostMapping("/tones")
    public ResponseEntity<ViralToneAdminDTO> createTone(@Valid @RequestBody ViralToneFormDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalog.createTone(dto));
    }

    @PutMapping("/tones/{id}")
    public ResponseEntity<ViralToneAdminDTO> updateTone(@PathVariable Long id,
                                                        @Valid @RequestBody ViralToneFormDTO dto) {
        return ResponseEntity.ok(catalog.updateTone(id, dto));
    }
}
