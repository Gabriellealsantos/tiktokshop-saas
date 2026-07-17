package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.FireSaleRequestDTO;
import com.venyx.tiktokshop.dtos.LiveSaleEventDTO;
import com.venyx.tiktokshop.dtos.LiveSalesConfigDTO;
import com.venyx.tiktokshop.dtos.LiveSalesFeedDTO;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.services.LiveSalesService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Feed de "vendas ao vivo" (prova social). Leitura aberta a qualquer usuário
 * autenticado; configuração de modo/intervalo e disparo manual são só ADMIN.
 * Cada disparo também é publicado em tempo real no tópico STOMP /topic/live-sales.
 */
@RestController
public class LiveSalesController {

    private final LiveSalesService service;

    public LiveSalesController(LiveSalesService service) {
        this.service = service;
    }

    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
    @GetMapping("/api/live-sales")
    public ResponseEntity<LiveSalesFeedDTO> getFeed() {
        return ResponseEntity.ok(service.getFeed());
    }

    @PreAuthorize("hasAuthority('" + RoleConstants.ROLE_ADMIN + "')")
    @GetMapping("/api/admin/live-sales/config")
    public ResponseEntity<LiveSalesConfigDTO> getConfig() {
        return ResponseEntity.ok(service.getConfig());
    }

    @PreAuthorize("hasAuthority('" + RoleConstants.ROLE_ADMIN + "')")
    @PutMapping("/api/admin/live-sales/config")
    public ResponseEntity<LiveSalesConfigDTO> updateConfig(@RequestBody LiveSalesConfigDTO dto) {
        return ResponseEntity.ok(service.updateConfig(dto));
    }

    @PreAuthorize("hasAuthority('" + RoleConstants.ROLE_ADMIN + "')")
    @PostMapping("/api/admin/live-sales/fire")
    public ResponseEntity<LiveSaleEventDTO> fire(@RequestBody(required = false) FireSaleRequestDTO request) {
        Long productId = request != null ? request.productId() : null;
        return ResponseEntity.ok(service.fireSale(productId));
    }
}
