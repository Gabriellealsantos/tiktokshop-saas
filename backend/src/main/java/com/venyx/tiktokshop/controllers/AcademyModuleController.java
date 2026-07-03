package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.AcademyModuleDTO;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.services.AcademyModuleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * Módulos da Creator Academy. Leitura (com aulas aninhadas) aberta a qualquer
 * usuário autenticado; CRUD restrito a SUPER_ADMIN — vídeo é link externo
 * (YouTube ou similar), não passa pelo StorageService/S3.
 */
@RestController
public class AcademyModuleController {

    private final AcademyModuleService service;

    public AcademyModuleController(AcademyModuleService service) {
        this.service = service;
    }

    @GetMapping("/api/academy/modules")
    public ResponseEntity<List<AcademyModuleDTO>> findAll() {
        return ResponseEntity.ok(service.findAllWithLessons());
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @GetMapping("/api/admin/academy/modules")
    public ResponseEntity<List<AcademyModuleDTO>> findAllAdmin() {
        return ResponseEntity.ok(service.findAllFlat());
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @PostMapping("/api/admin/academy/modules")
    public ResponseEntity<AcademyModuleDTO> insert(@RequestBody AcademyModuleDTO dto) {
        AcademyModuleDTO newDto = service.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.id()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @PutMapping("/api/admin/academy/modules/{id}")
    public ResponseEntity<AcademyModuleDTO> update(@PathVariable Long id, @RequestBody AcademyModuleDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @DeleteMapping("/api/admin/academy/modules/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
