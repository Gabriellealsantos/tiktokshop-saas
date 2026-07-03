package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.ProductDTO;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.services.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * Vitrine de produtos minerados. Leitura aberta a qualquer usuário autenticado;
 * curadoria (CRUD) restrita a ADMIN/SUPER_ADMIN — é catálogo de dado de
 * terceiro (produto do TikTok Shop), não preço da própria Venyx (ver CreditPackage).
 * Distinto de UserProduct, que é o produto próprio cadastrado pelo usuário.
 */
@RestController
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/api/products")
    public ResponseEntity<List<ProductDTO>> findAll(
            @RequestParam(value = "category", required = false) String category) {
        return ResponseEntity.ok(service.findAll(category));
    }

    @GetMapping("/api/products/{id}")
    public ResponseEntity<ProductDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @GetMapping("/api/admin/products")
    public ResponseEntity<List<ProductDTO>> findAllAdmin() {
        return ResponseEntity.ok(service.findAll(null));
    }

    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @PostMapping("/api/admin/products")
    public ResponseEntity<ProductDTO> insert(@RequestBody ProductDTO dto) {
        ProductDTO newDto = service.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.id()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @PutMapping("/api/admin/products/{id}")
    public ResponseEntity<ProductDTO> update(@PathVariable Long id, @RequestBody ProductDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @DeleteMapping("/api/admin/products/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
