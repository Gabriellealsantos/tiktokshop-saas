package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.DashboardMetricDTO;
import com.venyx.tiktokshop.dtos.DashboardMetricResetRequest;
import com.venyx.tiktokshop.dtos.DashboardResetResultDTO;
import com.venyx.tiktokshop.dtos.DashboardSummaryDTO;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.DashboardService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Métricas compostas do dashboard (faturamento/pedidos/comissão/ticket médio):
 * base cadastrada à mão pelo admin em /api/admin/dashboard/metrics, somada em
 * tempo real às vendas ao vivo estouradas. Visível a ADMIN e AFFILIATE (quem
 * enxerga faturamento); CRUD da base é só ADMIN.
 */
@RestController
public class DashboardController {

    private final DashboardService service;
    private final AuthService authService;

    public DashboardController(DashboardService service, AuthService authService) {
        this.service = service;
        this.authService = authService;
    }

    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
    @GetMapping("/api/dashboard")
    public ResponseEntity<DashboardSummaryDTO> getSummary(
            @RequestParam(value = "period", required = false) String period,
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "to", required = false) String to) {
        return ResponseEntity.ok(service.getSummary(authService.authenticated(), period, from, to));
    }

    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
    @GetMapping("/api/admin/dashboard/metrics")
    public ResponseEntity<List<DashboardMetricDTO>> listMetrics(
            @RequestParam(value = "periodType", required = false) String periodType) {
        return ResponseEntity.ok(service.listMetrics(authService.authenticated(), periodType));
    }

    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
    @PutMapping("/api/admin/dashboard/metrics")
    public ResponseEntity<DashboardMetricDTO> upsertMetric(@RequestBody DashboardMetricDTO dto) {
        return ResponseEntity.ok(service.upsertMetric(authService.authenticated(), dto));
    }

    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
    @DeleteMapping("/api/admin/dashboard/metrics/{id}")
    public ResponseEntity<Void> deleteMetric(@PathVariable Long id) {
        service.deleteMetric(authService.authenticated(), id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
    @PostMapping("/api/admin/dashboard/metrics/reset")
    public ResponseEntity<DashboardResetResultDTO> resetMetrics(
            @Valid @RequestBody DashboardMetricResetRequest request) {
        return ResponseEntity.ok(
                service.resetMetrics(authService.authenticated(), request.periodRefs(), request.clearLiveSales()));
    }
}

