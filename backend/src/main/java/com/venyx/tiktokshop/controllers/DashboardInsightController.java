package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.DashboardInsightDTO;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.services.DashboardInsightService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * Cards/dicas exibidos no dashboard do usuário.
 * Não confundir com o endpoint composto /api/dashboard?period= (métricas de
 * faturamento/vendas), que depende de uma entidade DashboardMetric ainda não
 * modelada e fica fora do escopo deste controller.
 */
@RestController
public class DashboardInsightController {

    private final DashboardInsightService service;

    public DashboardInsightController(DashboardInsightService service) {
        this.service = service;
    }

    @GetMapping("/api/dashboard/insights")
    public ResponseEntity<List<DashboardInsightDTO>> findActive(
            @RequestParam(value = "kind", required = false) String kind) {
        return ResponseEntity.ok(service.findActive(kind));
    }

    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @GetMapping("/api/admin/dashboard/insights")
    public ResponseEntity<List<DashboardInsightDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @PostMapping("/api/admin/dashboard/insights")
    public ResponseEntity<DashboardInsightDTO> insert(@RequestBody DashboardInsightDTO dto) {
        DashboardInsightDTO newDto = service.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.id()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @PutMapping("/api/admin/dashboard/insights/{id}")
    public ResponseEntity<DashboardInsightDTO> update(@PathVariable Long id, @RequestBody DashboardInsightDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @DeleteMapping("/api/admin/dashboard/insights/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
