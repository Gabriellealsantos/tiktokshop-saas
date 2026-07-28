package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.AuthSecuritySettingsDTO;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.services.AuthSecurityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Switch global de sessão única — leitura e escrita só para ADMIN. */
@RestController
@RequestMapping("/api/admin/auth-security")
@PreAuthorize("hasAuthority('" + RoleConstants.ROLE_ADMIN + "')")
public class AuthSecurityController {

    private final AuthSecurityService service;

    public AuthSecurityController(AuthSecurityService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<AuthSecuritySettingsDTO> get() {
        return ResponseEntity.ok(service.getSettings());
    }

    @PutMapping
    public ResponseEntity<AuthSecuritySettingsDTO> update(@RequestBody AuthSecuritySettingsDTO body) {
        return ResponseEntity.ok(service.updateSettings(body));
    }
}