package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.AcademyLessonDTO;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.services.AcademyLessonService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * Aulas da Creator Academy. Leitura aberta a qualquer usuário autenticado;
 * CRUD restrito a SUPER_ADMIN. videoUrl é um link externo (YouTube ou
 * qualquer host gratuito) — não há upload/storage próprio para vídeo.
 */
@RestController
public class AcademyLessonController {

    private final AcademyLessonService service;

    public AcademyLessonController(AcademyLessonService service) {
        this.service = service;
    }

    @GetMapping("/api/academy/lessons/{id}")
    public ResponseEntity<AcademyLessonDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @GetMapping("/api/admin/academy/lessons")
    public ResponseEntity<List<AcademyLessonDTO>> findByModule(@RequestParam Long moduleId) {
        return ResponseEntity.ok(service.findByModule(moduleId));
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @PostMapping("/api/admin/academy/lessons")
    public ResponseEntity<AcademyLessonDTO> insert(@RequestBody AcademyLessonDTO dto) {
        AcademyLessonDTO newDto = service.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.id()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @PutMapping("/api/admin/academy/lessons/{id}")
    public ResponseEntity<AcademyLessonDTO> update(@PathVariable Long id, @RequestBody AcademyLessonDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @DeleteMapping("/api/admin/academy/lessons/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
