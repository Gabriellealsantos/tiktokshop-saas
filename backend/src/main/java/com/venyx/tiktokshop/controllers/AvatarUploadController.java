package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.UploadResponseDTO;
import com.venyx.tiktokshop.services.generation.AvatarUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/avatars/reference")
public class AvatarUploadController {

    private final AvatarUploadService service;

    public AvatarUploadController(AvatarUploadService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AFFILIATE', 'CLIENT')")
    public ResponseEntity<UploadResponseDTO> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(new UploadResponseDTO(service.uploadReference(file)));
    }
}