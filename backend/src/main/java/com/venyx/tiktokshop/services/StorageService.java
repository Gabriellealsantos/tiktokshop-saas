package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.services.exceptions.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

/**
 * Upload de imagens para o bucket S3/MinIO configurado em StorageConfig.
 * Reutilizado por qualquer módulo que precise de uma URL de imagem
 * (galeria de avatares, produtos, etc) via StorageController.
 */
@Service
public class StorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.endpoint:}")
    private String endpoint;

    public StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public String upload(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Arquivo de imagem é obrigatório.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("Apenas arquivos de imagem são aceitos.");
        }

        String key = folder + "/" + UUID.randomUUID() + extensionOf(file.getOriginalFilename());

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(contentType)
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException e) {
            throw new BusinessException("Falha ao ler o arquivo enviado.");
        }

        return buildUrl(key);
    }

    private String extensionOf(String originalName) {
        if (originalName == null || !originalName.contains(".")) {
            return "";
        }
        return originalName.substring(originalName.lastIndexOf('.'));
    }

    private String buildUrl(String key) {
        if (endpoint != null && !endpoint.isBlank()) {
            return endpoint + "/" + bucket + "/" + key;
        }
        return "https://" + bucket + ".s3.amazonaws.com/" + key;
    }
}
