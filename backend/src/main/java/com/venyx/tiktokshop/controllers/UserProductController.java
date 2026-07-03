package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.UserProductDTO;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.UserProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * Produtos próprios cadastrados pelo usuário ("Usar meu próprio produto"),
 * distintos da vitrine curada em ProductController. Sem @PreAuthorize por
 * role: é dado "self", qualquer autenticado mexe apenas no que é seu
 * (ownership resolvido via AuthService.authenticated()).
 */
@RestController
@RequestMapping("/api/user-products")
public class UserProductController {

    private final UserProductService service;
    private final AuthService authService;

    public UserProductController(UserProductService service, AuthService authService) {
        this.service = service;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<UserProductDTO>> findAll() {
        User user = authService.authenticated();
        return ResponseEntity.ok(service.findAllForUser(user.getUuid()));
    }

    @PostMapping
    public ResponseEntity<UserProductDTO> insert(@RequestBody UserProductDTO dto) {
        User user = authService.authenticated();
        UserProductDTO newDto = service.insert(user, dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.id()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProductDTO> update(@PathVariable Long id, @RequestBody UserProductDTO dto) {
        User user = authService.authenticated();
        return ResponseEntity.ok(service.update(user, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User user = authService.authenticated();
        service.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}
