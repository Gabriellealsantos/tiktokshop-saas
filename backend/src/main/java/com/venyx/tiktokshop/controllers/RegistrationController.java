package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.RegisterDTO;
import com.venyx.tiktokshop.services.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints públicos de auto-cadastro e confirmação de e-mail.
 */
@RestController
@RequestMapping("/api/auth")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody @Valid RegisterDTO dto) {
        registrationService.register(dto);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/confirm")
    public ResponseEntity<Void> confirm(@RequestParam("token") String token) {
        registrationService.confirm(token);
        return ResponseEntity.noContent().build();
    }
}
