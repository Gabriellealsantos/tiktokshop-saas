package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.services.exceptions.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;

/**
 * Upload de imagens para o bucket S3/MinIO configurado em StorageConfig.
 * Reutilizado por qualquer módulo que precise de uma URL de imagem
 * (galeria de avatares, produtos, etc) via StorageController.
 */
@Service
public class StorageService {

    private static final Logger logger = LoggerFactory.getLogger(StorageService.class);
    private static final int UPLOAD_ATTEMPTS = 3;

    private static final Map<String, byte[]> MAGIC_BYTES = Map.of(
            "image/png",  new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47},
            "image/jpeg", new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF});

    // WEBP não tem um prefixo simples: é "RIFF" + 4 bytes de tamanho (variável) + "WEBP".
    private static final byte[] RIFF_MAGIC = new byte[]{0x52, 0x49, 0x46, 0x46};
    private static final byte[] WEBP_MAGIC = new byte[]{0x57, 0x45, 0x42, 0x50};

    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/png",  ".png",
            "image/jpeg", ".jpg",
            "image/webp", ".webp");

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

        try {
            return upload(file.getBytes(), contentType, folder);
        } catch (IOException e) {
            throw new BusinessException("Falha ao ler o arquivo enviado.");
        }
    }

    public String upload(byte[] content, String contentType, String folder) {
        if (content == null || content.length == 0) {
            throw new BusinessException("Conteúdo da imagem está vazio.");
        }
        if (folder == null || !folder.matches("[a-zA-Z0-9/_-]+")) {
            throw new BusinessException("Pasta de destino inválida.");
        }

        String normalizedType = contentType == null ? "" : contentType.toLowerCase();
        assertRealImage(content, normalizedType);

        String key = folder + "/" + UUID.randomUUID() + EXTENSIONS.get(normalizedType);

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(normalizedType)
                        .build(),
                RequestBody.fromBytes(content));

        return buildUrl(key);
    }

    public String uploadWithRetry(byte[] content, String contentType, String folder) {
        RuntimeException last = null;

        for (int attempt = 1; attempt <= UPLOAD_ATTEMPTS; attempt++) {
            try {
                return upload(content, contentType, folder);
            } catch (BusinessException e) {
                throw e;
            } catch (RuntimeException e) {
                last = e;
                logger.warn("Falha no upload (tentativa {}/{}): {}", attempt, UPLOAD_ATTEMPTS, e.getMessage());
                if (attempt < UPLOAD_ATTEMPTS) {
                    sleep(attempt);
                }
            }
        }

        logger.error("Upload falhou após {} tentativas — imagem gerada foi perdida.", UPLOAD_ATTEMPTS, last);
        throw new BusinessException("Falha ao armazenar a imagem. Tente novamente.");
    }

    private void sleep(int attempt) {
        try {
            Thread.sleep(attempt * 500L);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("Upload interrompido.");
        }
    }

    public String publicBaseUrl() {
        if (endpoint != null && !endpoint.isBlank()) {
            return endpoint + "/" + bucket;
        }
        return "https://" + bucket + ".s3.amazonaws.com";
    }

    private void assertRealImage(byte[] content, String contentType) {
        if ("image/webp".equals(contentType)) {
            if (!isValidWebp(content)) {
                throw new BusinessException("O arquivo enviado não é uma imagem válida.");
            }
            return;
        }
        byte[] expected = MAGIC_BYTES.get(contentType);
        if (expected == null) {
            throw new BusinessException("Formato de imagem não suportado: " + contentType);
        }
        if (!startsWith(content, expected)) {
            throw new BusinessException("O arquivo enviado não é uma imagem válida.");
        }
    }

    private boolean startsWith(byte[] content, byte[] prefix) {
        if (content.length < prefix.length) {
            return false;
        }
        return Arrays.equals(content, 0, prefix.length, prefix, 0, prefix.length);
    }

    /** WEBP não tem um prefixo único: valida o container RIFF e a assinatura WEBP no offset 8. */
    private boolean isValidWebp(byte[] content) {
        return content.length >= 12
                && startsWith(content, RIFF_MAGIC)
                && Arrays.equals(content, 8, 12, WEBP_MAGIC, 0, 4);
    }

    private String buildUrl(String key) {
        return publicBaseUrl() + "/" + key;
    }


}