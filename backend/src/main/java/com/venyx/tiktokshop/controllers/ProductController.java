package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.MiningStatusDTO;
import com.venyx.tiktokshop.dtos.ProductDTO;
import com.venyx.tiktokshop.dtos.UploadResponseDTO;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.FavoriteService;
import com.venyx.tiktokshop.services.ProductService;
import com.venyx.tiktokshop.services.StorageService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * Vitrine de produtos minerados. Leitura aberta a qualquer usuário autenticado;
 * curadoria (CRUD) restrita ao ADM (ROLE_ADMIN) — é catálogo de dado de
 * terceiro (produto do TikTok Shop), não preço da própria Venyx.
 * Distinto de UserProduct, que é o produto próprio cadastrado pelo usuário.
 */
@RestController
public class ProductController {

    /** Pasta fixa no bucket para as imagens efêmeras de produto próprio do usuário. */
    private static final String CUSTOM_PRODUCT_FOLDER = "custom-products";

    private final ProductService service;
    private final FavoriteService favoriteService;
    private final AuthService authService;
    private final StorageService storageService;

    public ProductController(ProductService service, FavoriteService favoriteService,
                             AuthService authService, StorageService storageService) {
        this.service = service;
        this.favoriteService = favoriteService;
        this.authService = authService;
        this.storageService = storageService;
    }

    @GetMapping("/api/products")
    public ResponseEntity<Page<ProductDTO>> search(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "window", required = false) String miningWindow,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(service.search(search, category, miningWindow, sort, page, size));
    }

    @GetMapping("/api/products/mining-status")
    public ResponseEntity<MiningStatusDTO> miningStatus() {
        return ResponseEntity.ok(service.miningStatus());
    }

    @GetMapping("/api/products/{id}")
    public ResponseEntity<ProductDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/api/products/me/favorites")
    public ResponseEntity<List<ProductDTO>> myFavorites() {
        return ResponseEntity.ok(favoriteService.listMine(authService.authenticated()));
    }

    @PostMapping("/api/products/{id}/favorite")
    public ResponseEntity<Void> favorite(@PathVariable Long id) {
        favoriteService.add(authService.authenticated(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/products/{id}/favorite")
    public ResponseEntity<Void> unfavorite(@PathVariable Long id) {
        favoriteService.remove(authService.authenticated(), id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Upload EFÊMERO da imagem de um "produto próprio" do usuário pagante.
     * Sobe a imagem pro storage e devolve a URL para o passo de criação usar — NÃO
     * persiste nenhum produto (nem em products, nem em user_products). O nome do produto
     * é carregado pelo front. Recurso self: sem @PreAuthorize (basta estar autenticado),
     * diferente do upload admin, que aceita pasta livre; aqui a pasta é fixa no servidor.
     */
    @PostMapping(value = "/api/products/custom/image", consumes = "multipart/form-data")
    public ResponseEntity<UploadResponseDTO> uploadCustomProductImage(@RequestParam("file") MultipartFile file) {
        authService.authenticated(); // garante contexto autenticado
        String url = storageService.upload(file, CUSTOM_PRODUCT_FOLDER);
        return ResponseEntity.ok(new UploadResponseDTO(url));
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @GetMapping("/api/admin/products")
    public ResponseEntity<List<ProductDTO>> findAllAdmin() {
        return ResponseEntity.ok(service.findAll(null));
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @PostMapping("/api/admin/products")
    public ResponseEntity<ProductDTO> insert(@RequestBody ProductDTO dto) {
        ProductDTO newDto = service.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.id()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @PutMapping("/api/admin/products/{id}")
    public ResponseEntity<ProductDTO> update(@PathVariable Long id, @RequestBody ProductDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @DeleteMapping("/api/admin/products/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
