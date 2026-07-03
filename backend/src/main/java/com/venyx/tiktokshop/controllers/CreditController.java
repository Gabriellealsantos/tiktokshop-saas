package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.CreditTransactionDTO;
import com.venyx.tiktokshop.dtos.CreditWalletDTO;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.CreditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Expõe a carteira de créditos do usuário autenticado (saldo, extrato, uso mensal).
 * Sem @PreAuthorize: é recurso "self", o ResourceServerConfig já exige autenticação.
 */
@RestController
@RequestMapping("/users/me")
public class CreditController {

    private final CreditService creditService;
    private final AuthService authService;

    public CreditController(CreditService creditService, AuthService authService) {
        this.creditService = creditService;
        this.authService = authService;
    }

    @GetMapping("/wallet")
    public ResponseEntity<CreditWalletDTO> wallet() {
        User user = authService.authenticated();
        return ResponseEntity.ok(creditService.getWallet(user.getId()));
    }

    @GetMapping("/wallet/transactions")
    public ResponseEntity<List<CreditTransactionDTO>> transactions() {
        User user = authService.authenticated();
        return ResponseEntity.ok(creditService.getStatement(user.getId()));
    }

    @GetMapping("/usage")
    public ResponseEntity<Integer> usage() {
        User user = authService.authenticated();
        return ResponseEntity.ok(creditService.monthlyGenerationUsage(user.getId()));
    }
}
