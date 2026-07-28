package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.services.AuthSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Encerramento de sessão pelo lado do resource server.
 *
 * Existe porque o /oauth2/revoke padrão não é utilizável por este frontend: o
 * client é público (sem secret no browser) e o endpoint de revogação exige
 * autenticação de client, então a chamada só devolve 302 pro /login sem revogar
 * nada. Aqui o Bearer do próprio usuário já é a prova de posse do token.
 *
 * Fica em /api/auth (autenticado) e não em /auth (permitAll), senão não haveria
 * como saber de quem é a sessão a encerrar.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthSessionController {

    private final AuthSessionService authSessionService;

    public AuthSessionController(AuthSessionService authSessionService) {
        this.authSessionService = authSessionService;
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal Jwt jwt) {
        if (jwt != null) {
            authSessionService.revokeAuthorization(jwt.getTokenValue());
        }
        return ResponseEntity.noContent().build();
    }
}
