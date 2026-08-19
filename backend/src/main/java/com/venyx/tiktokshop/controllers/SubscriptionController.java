package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.ActivateSubscriptionDTO;
import com.venyx.tiktokshop.dtos.PlanDTO;
import com.venyx.tiktokshop.dtos.SubscriptionDTO;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.services.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Gestão de assinaturas pelo admin. Pagamento é link externo (sem gateway/webhook):
 * o admin "libera" o acesso manualmente escolhendo o plano.
 */
@RestController
public class SubscriptionController {

    private final SubscriptionService service;

    public SubscriptionController(SubscriptionService service) {
        this.service = service;
    }

    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
    @GetMapping("/api/admin/plans")
    public ResponseEntity<List<PlanDTO>> listPlans() {
        return ResponseEntity.ok(service.listPlans());
    }

    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
    @GetMapping("/api/admin/users/{id}/subscription")
    public ResponseEntity<SubscriptionDTO> getByUser(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getByUser(id));
    }

    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
    @PostMapping("/api/admin/users/{id}/subscription/activate")
    public ResponseEntity<SubscriptionDTO> activate(
            @PathVariable UUID id,
            @RequestBody @Valid ActivateSubscriptionDTO dto) {
        return ResponseEntity.ok(service.activate(id, dto.planType()));
    }

    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
    @PostMapping("/api/admin/users/{id}/subscription/revoke")
    public ResponseEntity<SubscriptionDTO> revoke(@PathVariable UUID id) {
        return ResponseEntity.ok(service.revoke(id));
    }

    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
    @DeleteMapping("/api/admin/users/{id}/subscription")
    public ResponseEntity<Void> cancel(@PathVariable UUID id) {
        service.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
