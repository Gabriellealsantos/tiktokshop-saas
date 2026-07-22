package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.UploadResponseDTO;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.services.StorageService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Upload genérico de mídia (S3/MinIO), reutilizável por qualquer módulo
 * que precise de uma URL de imagem ou vídeo (galeria de avatares, produtos,
 * preview de templates virais, etc).
 * O fluxo do admin é: sobe a mídia aqui, pega a URL, usa no campo
 * imageUrl/previewVideoUrl dos DTOs de criação/atualização de cada módulo.
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

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @PostMapping(value = "/api/admin/storage/upload-video", consumes = "multipart/form-data")
    public ResponseEntity<UploadResponseDTO> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "misc") String folder) {
        String url = storageService.uploadVideo(file, folder);
        return ResponseEntity.ok(new UploadResponseDTO(url));
    }

    @PreAuthorize("hasAnyRole('ADMIN','AFFILIATE','CLIENT')")
    @GetMapping("/api/storage/download")
    public ResponseEntity<byte[]> download(
            @RequestParam("url") String url,
            @RequestParam(value = "filename", required = false) String filename) {
        StorageService.DownloadedFile file = storageService.download(url);
        String name = (filename == null || filename.isBlank()) ? file.filename() : filename;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + name + "\"")
                .contentType(MediaType.parseMediaType(file.contentType()))
                .body(file.content());
    }
}
