package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.services.exceptions.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;

/**
 * Upload de imagens e vídeos para o bucket S3/MinIO configurado em StorageConfig.
 * Reutilizado por qualquer módulo que precise de uma URL pública de mídia
 * (galeria de avatares, produtos, preview de templates virais, etc) via StorageController.
 */
@Service
public class StorageService {

    @Value("${aws.s3.public-url:}")
    private String publicUrl;

    @Value("${aws.s3.region}")
    private String region;

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

    private static final Map<String, String> VIDEO_EXTENSIONS = Map.of(
            "video/mp4",  ".mp4",
            "video/webm", ".webm");

    // MP4: o box "ftyp" fica no offset 4 (bytes 0-3 são o tamanho do box).
    private static final byte[] MP4_FTYP = new byte[]{0x66, 0x74, 0x79, 0x70};
    // WEBM/Matroska: header EBML no offset 0.
    private static final byte[] WEBM_MAGIC = new byte[]{0x1A, 0x45, (byte) 0xDF, (byte) 0xA3};

    private static final Map<String, String> AUDIO_EXTENSIONS = Map.of(
            "audio/mpeg", ".mp3",
            "audio/wav",  ".wav",
            "audio/ogg",  ".ogg");

    // MP3: ou tem tag ID3 no início, ou começa direto num frame sync (11 bits em 1: FF Ex/Fx/Ax/Bx).
    private static final byte[] ID3_MAGIC = new byte[]{0x49, 0x44, 0x33};
    // WAV: "RIFF" + tamanho (offset 4-7) + "WAVE" no offset 8, mesmo container do WEBP.
    private static final byte[] WAVE_MAGIC = new byte[]{0x57, 0x41, 0x56, 0x45};
    // OGG: página começa com "OggS".
    private static final byte[] OGG_MAGIC = new byte[]{0x4F, 0x67, 0x67, 0x53};

    private final S3Client s3Client;
    private final ImageNormalizer imageNormalizer;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.endpoint:}")
    private String endpoint;

    public StorageService(S3Client s3Client, ImageNormalizer imageNormalizer) {
        this.s3Client = s3Client;
        this.imageNormalizer = imageNormalizer;
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
            return upload(imageNormalizer.toJpeg(file.getBytes()), "image/jpeg", folder);
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

    public String uploadVideo(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Arquivo de vídeo é obrigatório.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new BusinessException("Apenas arquivos de vídeo são aceitos.");
        }

        try {
            return uploadVideo(file.getBytes(), contentType, folder);
        } catch (IOException e) {
            throw new BusinessException("Falha ao ler o arquivo enviado.");
        }
    }

    public String uploadVideo(byte[] content, String contentType, String folder) {
        if (content == null || content.length == 0) {
            throw new BusinessException("Conteúdo do vídeo está vazio.");
        }
        if (folder == null || !folder.matches("[a-zA-Z0-9/_-]+")) {
            throw new BusinessException("Pasta de destino inválida.");
        }

        String normalizedType = contentType == null ? "" : contentType.toLowerCase();
        assertRealVideo(content, normalizedType);

        String key = folder + "/" + UUID.randomUUID() + VIDEO_EXTENSIONS.get(normalizedType);

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(normalizedType)
                        .build(),
                RequestBody.fromBytes(content));

        return buildUrl(key);
    }

    public String uploadAudio(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Arquivo de áudio é obrigatório.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("audio/")) {
            throw new BusinessException("Apenas arquivos de áudio são aceitos.");
        }

        try {
            return uploadAudio(file.getBytes(), contentType, folder);
        } catch (IOException e) {
            throw new BusinessException("Falha ao ler o arquivo enviado.");
        }
    }

    public String uploadAudio(byte[] content, String contentType, String folder) {
        if (content == null || content.length == 0) {
            throw new BusinessException("Conteúdo do áudio está vazio.");
        }
        if (folder == null || !folder.matches("[a-zA-Z0-9/_-]+")) {
            throw new BusinessException("Pasta de destino inválida.");
        }

        String normalizedType = contentType == null ? "" : contentType.toLowerCase();
        assertRealAudio(content, normalizedType);

        String key = folder + "/" + UUID.randomUUID() + AUDIO_EXTENSIONS.get(normalizedType);

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(normalizedType)
                        .build(),
                RequestBody.fromBytes(content));

        return buildUrl(key);
    }

    /**
     * Busca um objeto do próprio bucket para forçar download no browser (o atributo
     * download do <a> é ignorado cross-origin, então o front baixa via este proxy).
     * Valida que a URL pertence ao nosso storage — evita SSRF (não busca URL arbitrária).
     */
    public DownloadedFile download(String url) {
        if (url == null || url.isBlank()) {
            throw new BusinessException("URL do arquivo é obrigatória.");
        }
        String base = publicBaseUrl() + "/";
        if (!url.startsWith(base)) {
            throw new BusinessException("URL fora do storage permitido.");
        }
        String key = url.substring(base.length());

        var object = s3Client.getObjectAsBytes(
                GetObjectRequest.builder().bucket(bucket).key(key).build());
        String contentType = object.response().contentType();
        String filename = key.substring(key.lastIndexOf('/') + 1);

        return new DownloadedFile(
                object.asByteArray(),
                contentType != null ? contentType : "application/octet-stream",
                filename);
    }

    public record DownloadedFile(byte[] content, String contentType, String filename) {}

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
        if (publicUrl != null && !publicUrl.isBlank()) {
            return publicUrl;
        }
        if (endpoint != null && !endpoint.isBlank()) {
            return endpoint + "/" + bucket;
        }
        return "https://" + bucket + ".s3." + region + ".amazonaws.com";
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

    private void assertRealVideo(byte[] content, String contentType) {
        if (!VIDEO_EXTENSIONS.containsKey(contentType)) {
            throw new BusinessException("Formato de vídeo não suportado: " + contentType);
        }
        boolean valid = switch (contentType) {
            // No MP4 o box "ftyp" fica no offset 4, não no início do arquivo.
            case "video/mp4"  -> content.length >= 8 && Arrays.equals(content, 4, 8, MP4_FTYP, 0, 4);
            case "video/webm" -> startsWith(content, WEBM_MAGIC);
            default -> false;
        };
        if (!valid) {
            throw new BusinessException("O arquivo enviado não é um vídeo válido.");
        }
    }

    private void assertRealAudio(byte[] content, String contentType) {
        if (!AUDIO_EXTENSIONS.containsKey(contentType)) {
            throw new BusinessException("Formato de áudio não suportado: " + contentType);
        }
        boolean valid = switch (contentType) {
            case "audio/mpeg" -> isValidMp3(content);
            case "audio/wav"  -> content.length >= 12
                    && startsWith(content, RIFF_MAGIC)
                    && Arrays.equals(content, 8, 12, WAVE_MAGIC, 0, 4);
            case "audio/ogg"  -> startsWith(content, OGG_MAGIC);
            default -> false;
        };
        if (!valid) {
            throw new BusinessException("O arquivo enviado não é um áudio válido.");
        }
    }

    /** MP3 ou tem tag ID3 no início, ou começa direto num frame sync (FF seguido de Ex/Fx/Ax/Bx). */
    private boolean isValidMp3(byte[] content) {
        if (startsWith(content, ID3_MAGIC)) {
            return true;
        }
        return content.length >= 2
                && (content[0] & 0xFF) == 0xFF
                && (content[1] & 0xE0) == 0xE0;
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