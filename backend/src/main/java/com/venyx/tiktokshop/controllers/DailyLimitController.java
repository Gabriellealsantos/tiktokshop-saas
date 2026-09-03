package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.DailyLimitDTO;
import com.venyx.tiktokshop.dtos.UserLimitOverridesDTO;
import com.venyx.tiktokshop.entities.enums.FlowType;
import com.venyx.tiktokshop.services.DailyLimitService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/daily-limits")
public class DailyLimitController {

    private final DailyLimitService service;

    public DailyLimitController(DailyLimitService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DailyLimitDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{flowType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DailyLimitDTO> findByFlowType(@PathVariable FlowType flowType) {
        return ResponseEntity.ok(service.findByFlowType(flowType));
    }

    @PutMapping("/{flowType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DailyLimitDTO> update(@PathVariable FlowType flowType,
                                                @Valid @RequestBody DailyLimitDTO dto) {
        return ResponseEntity.ok(service.update(flowType, dto));
    }

    // ── Exceções individuais (modal "Limites" no card do usuário) ────────────

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserLimitOverridesDTO> findUserOverrides(@PathVariable UUID userId) {
        return ResponseEntity.ok(service.findUserOverrides(userId));
    }

    @PutMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserLimitOverridesDTO> updateUserOverrides(
            @PathVariable UUID userId,
            @Valid @RequestBody UserLimitOverridesDTO dto) {
        return ResponseEntity.ok(service.updateUserOverrides(userId, dto));
    }
}
