package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.GalleryAvatarDTO;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.services.GalleryAvatarService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * Galeria de avatares prontos usados no módulo de Avatar.
 * CRUD administrativo aberto ao ADM (ROLE_ADMIN).
 */
@RestController
public class GalleryAvatarController {

    private final GalleryAvatarService service;

    public GalleryAvatarController(GalleryAvatarService service) {
        this.service = service;
    }

    @GetMapping("/api/avatars/gallery")
    public ResponseEntity<List<GalleryAvatarDTO>> findGallery(
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "type", required = false) String type) {
        return ResponseEntity.ok(service.findGallery(gender, type));
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @GetMapping("/api/admin/avatars/gallery")
    public ResponseEntity<List<GalleryAvatarDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @PostMapping("/api/admin/avatars/gallery")
    public ResponseEntity<GalleryAvatarDTO> insert(@RequestBody GalleryAvatarDTO dto) {
        GalleryAvatarDTO newDto = service.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.id()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @PutMapping("/api/admin/avatars/gallery/{id}")
    public ResponseEntity<GalleryAvatarDTO> update(@PathVariable Long id, @RequestBody GalleryAvatarDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @DeleteMapping("/api/admin/avatars/gallery/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
