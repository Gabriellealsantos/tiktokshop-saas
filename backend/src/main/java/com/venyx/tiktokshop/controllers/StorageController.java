package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.UploadResponseDTO;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.services.StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Upload genérico de imagens (S3/MinIO), reutilizável por qualquer módulo
 * que precise de uma URL de imagem (galeria de avatares, produtos, etc).
 * O fluxo do admin é: sobe a imagem aqui, pega a URL, usa no campo
 * imageUrl dos DTOs de criação/atualização de cada módulo.
 */
@RestController
public class StorageController {

    private final StorageService storageService;

    public StorageController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @PostMapping(value = "/api/admin/storage/upload", consumes = "multipart/form-data")
    public ResponseEntity<UploadResponseDTO> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "misc") String folder) {
        String url = storageService.upload(file, folder);
        return ResponseEntity.ok(new UploadResponseDTO(url));
    }
}
