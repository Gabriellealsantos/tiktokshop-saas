package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class AvatarUploadService {

    private static final String REFERENCE_FOLDER = "references";

    private final StorageService storageService;
    private final AuthService authService;

    public AvatarUploadService(StorageService storageService, AuthService authService) {
        this.storageService = storageService;
        this.authService = authService;
    }

    public String uploadReference(MultipartFile file) {
        UUID userId = authService.authenticated().getUuid();
        return storageService.upload(file, REFERENCE_FOLDER + "/" + userId);
    }
}