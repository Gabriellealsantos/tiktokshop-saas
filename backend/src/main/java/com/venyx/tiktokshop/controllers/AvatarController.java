package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.AvatarDTO;
import com.venyx.tiktokshop.dtos.AvatarFromGenerationDTO;
import com.venyx.tiktokshop.dtos.AvatarFromUploadDTO;
import com.venyx.tiktokshop.dtos.AvatarRenameDTO;
import com.venyx.tiktokshop.services.AvatarService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

import static org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromCurrentContextPath;

@RestController
@RequestMapping("/api/avatars")
public class AvatarController {

    private static final String USER_ROLES = "hasAnyRole('ADMIN', 'AFFILIATE', 'CLIENT')";

    private final AvatarService service;

    public AvatarController(AvatarService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize(USER_ROLES)
    public ResponseEntity<Page<AvatarDTO>> findAll(
            @PageableDefault(size = 20, sort = "created_at", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(service.findAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize(USER_ROLES)
    public ResponseEntity<AvatarDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping("/from-generation")
    @PreAuthorize(USER_ROLES)
    public ResponseEntity<AvatarDTO> saveFromGeneration(@Valid @RequestBody AvatarFromGenerationDTO dto) {
        return created(service.saveFromGeneration(dto));
    }

    @PostMapping("/from-upload")
    @PreAuthorize(USER_ROLES)
    public ResponseEntity<AvatarDTO> saveFromUpload(@Valid @RequestBody AvatarFromUploadDTO dto) {
        return created(service.saveFromUpload(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize(USER_ROLES)
    public ResponseEntity<AvatarDTO> rename(@PathVariable Long id, @Valid @RequestBody AvatarRenameDTO dto) {
        return ResponseEntity.ok(service.rename(id, dto.name()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(USER_ROLES)
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<AvatarDTO> created(AvatarDTO dto) {
        URI uri = fromCurrentContextPath()
                .path("/api/avatars/{id}")
                .buildAndExpand(dto.id())
                .toUri();
        return ResponseEntity.created(uri).body(dto);
    }
}