package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.EmailDTO;
import com.venyx.tiktokshop.dtos.NewPasswordDTO;
import com.venyx.tiktokshop.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller responsável pelos endpoints públicos de autenticação.
 * Aqui são tratados fluxos como recuperação de senha.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Gera e envia um token de recuperação de senha por e-mail para o usuário fornecido.
     * body Dados que contêm o e-mail do usuário.
     */
    @PostMapping(value = "/recover-token")
    public ResponseEntity<Void> createRecoverToken(@Valid @RequestBody EmailDTO body) {
        authService.createRecoverToken(body);
        return ResponseEntity.noContent().build();
    }

    /**
     * Salva uma nova senha usando o token de recuperação enviado previamente por e-mail.
     * body Dados contendo a nova senha e o token válido.
     */
    @PutMapping(value = "/new-password")
    public ResponseEntity<Void> saveNewPassword(@Valid @RequestBody NewPasswordDTO body) {
        authService.saveNewPassword(body);
        return ResponseEntity.noContent().build();
    }
}
