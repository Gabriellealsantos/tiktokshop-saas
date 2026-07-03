package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.CreditPackageDTO;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.services.CreditPackageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * Catálogo de pacotes de créditos disponíveis para compra.
 * CRUD administrativo restrito a SUPER_ADMIN por envolver preço/monetização.
 */
@RestController
public class CreditPackageController {

    private final CreditPackageService service;

    public CreditPackageController(CreditPackageService service) {
        this.service = service;
    }

    @GetMapping("/api/credit-packages")
    public ResponseEntity<List<CreditPackageDTO>> findActive() {
        return ResponseEntity.ok(service.findActive());
    }

    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @GetMapping("/api/admin/credit-packages")
    public ResponseEntity<List<CreditPackageDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @PostMapping("/api/admin/credit-packages")
    public ResponseEntity<CreditPackageDTO> insert(@RequestBody CreditPackageDTO dto) {
        CreditPackageDTO newDto = service.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.id()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @PutMapping("/api/admin/credit-packages/{id}")
    public ResponseEntity<CreditPackageDTO> update(@PathVariable Long id, @RequestBody CreditPackageDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @DeleteMapping("/api/admin/credit-packages/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
