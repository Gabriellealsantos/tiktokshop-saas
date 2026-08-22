package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.services.ImageNormalizer;
import com.venyx.tiktokshop.services.StorageService;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.lang.Math.pow;
import static java.lang.Thread.currentThread;
import static java.util.concurrent.ThreadLocalRandom.current;

import org.springframework.http.client.JdkClientHttpRequestFactory;

import static java.net.http.HttpClient.Redirect.NEVER;
import static java.net.http.HttpResponse.BodyHandlers.ofByteArray;
import static java.time.Duration.ofSeconds;

import static java.util.Base64.getDecoder;
import static java.util.Base64.getEncoder;

@Component
@ConditionalOnProperty(name = "venyx.image-provider", havingValue = "gemini")
public class GeminiImageProvider  implements ImageProvider {

    private static final Logger logger = LoggerFactory.getLogger(GeminiImageProvider.class);

    private static final int MAX_RETRIES = 3;
    /** Um timeout pode significar que o Gemini processou e cobrou. Insistir gasta cota. */
    private static final int MAX_TIMEOUT_ATTEMPTS = 2;
    private static final Set<Integer> RETRYABLE = Set.of(429, 500, 502, 503, 504);

    private final RestClient restClient;
    private final StorageService storageService;
    private final String model;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String aspectRatio;
    private final String imageSize;
    private final String thinkingLevel;
    private final ImageNormalizer imageNormalizer;

    public GeminiImageProvider(StorageService storageService,
                               ObjectMapper objectMapper,
                               ImageNormalizer imageNormalizer,
                               @Value("${venyx.gemini.base-url}") String baseUrl,
                               @Value("${venyx.gemini.api-key}") String apiKey,
                               @Value("${venyx.gemini.model}") String model,
                               @Value("${venyx.gemini.image-timeout-seconds:240}") int timeoutSeconds,
                               @Value("${venyx.gemini.image-aspect-ratio}") String aspectRatio,
                               @Value("${venyx.gemini.image-size:1K}") String imageSize,
                               @Value("${venyx.gemini.thinking-level:high}") String thinkingLevel) {
        this.storageService = storageService;
        this.imageNormalizer = imageNormalizer;
        this.objectMapper = objectMapper;
        this.model = model;
        this.aspectRatio = aspectRatio;
        this.imageSize = imageSize;
        this.thinkingLevel = thinkingLevel.trim();

        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory();
        factory.setReadTimeout(ofSeconds(timeoutSeconds));

        this.httpClient = HttpClient.newBuilder()
                .followRedirects(NEVER)
                .connectTimeout(ofSeconds(10))
                .build();

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .baseUrl(baseUrl)
                .defaultHeader("x-goog-api-key", apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Override
    public ImageProviderResult generate(ImageProviderRequest request) {
        Map<String, Object> body = Map.of(
                "model", model,
                "input", buildInput(request),
                "generation_config", Map.of("thinking_level", thinkingLevel),
                "response_format", Map.of(
                        "type", "image",
                        "mime_type", "image/jpeg",
                        "aspect_ratio", aspectRatio,
                        "image_size", imageSize));

        String payload = objectMapper.writeValueAsString(body);

        String raw;
        try {
            raw = postWithRetry(payload);
        } catch (RestClientResponseException e) {
            logger.error("[GEMINI] Falha na API. Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (isDailyQuotaExhausted(e)) {
                throw new BusinessException("O limite diário de gerações de imagem foi atingido. As gerações voltam amanhã.");
            }
            if (e.getStatusCode().is5xxServerError() || e.getStatusCode().value() == 429) {
                throw new BusinessException("A Inteligência Artificial do Google (Gemini) está sobrecarregada no momento. Por favor, tente novamente em alguns instantes.");
            }
            throw new BusinessException("Ocorreu um erro ao comunicar com a Inteligência Artificial. Tente novamente.");
        } catch (ResourceAccessException e) {
            logger.error("[GEMINI] Falha de conexao/timeout", e);
            throw new BusinessException("A Inteligência Artificial demorou muito para responder. Por favor, tente novamente.");
        } catch (Exception e) {
            logger.error("[GEMINI] Erro inesperado", e);
            throw new BusinessException("Erro inesperado ao conectar com a Inteligência Artificial.");
        }

        logger.debug("[GEMINI] resposta recebida ({} bytes)", raw.length());

        JsonNode image = findImageNode(objectMapper.readTree(raw));
        if (image == null) {
            throw new BusinessException("Gemini não retornou imagem.");
        }

        byte[] bytes = getDecoder().decode(image.path("data").asText());
        String mimeType = image.path("mime_type").asText("image/png");

        return new ImageProviderResult(bytes, mimeType);
    }


    private List<Map<String, Object>> buildInput(ImageProviderRequest request) {
        List<Map<String, Object>> input = new ArrayList<>();
        input.add(Map.of("type", "text", "text", request.prompt()));

        // Ordem preservada: image 1, image 2, ... conforme a lista de referências.
        for (String url : request.referenceImageUrls()) {
            // O storage guarda a imagem em resolução cheia, mas o payload da API não precisa
            // dela: 2048px já bastam para o modelo e cortam o tamanho da requisição em várias
            // vezes. Sem isso, uma geração 2K reenviada como referência sozinha passa de 2MB.
            byte[] reference = imageNormalizer.toJpeg(downloadReference(url));
            input.add(Map.of(
                    "type", "image",
                    "mime_type", "image/jpeg",
                    "data", getEncoder().encodeToString(reference)));
        }
        return input;
    }


    /** Deriva o mime dos magic bytes — a referência pode ser PNG (avatar) ou JPEG (produto). */
    private String resolveMimeType(byte[] content) {
        if (content.length >= 3
                && (content[0] & 0xFF) == 0xFF && (content[1] & 0xFF) == 0xD8 && (content[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if (content.length >= 12
                && content[0] == 'R' && content[1] == 'I' && content[2] == 'F' && content[3] == 'F'
                && content[8] == 'W' && content[9] == 'E' && content[10] == 'B' && content[11] == 'P') {
            return "image/webp";
        }
        return "image/png";
    }

    private byte[] downloadReference(String url) {
        URI uri = parseAndValidate(url);
        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(ofSeconds(20))
                .GET()
                .build();

        try {
            HttpResponse<byte[]> response = httpClient.send(request, ofByteArray());
            if (response.statusCode() != 200) {
                byte[] body = response.body();
                String preview = body == null ? "" : new String(body, 0, Math.min(body.length, 300), StandardCharsets.UTF_8);
                logger.error("[GEMINI] falha ao baixar referência. status={} url={} body={}",
                        response.statusCode(), url, preview);
                throw new BusinessException("Falha ao baixar a imagem de referência.");
            }
            return response.body();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("Download da imagem de referência interrompido.");
        } catch (IOException e) {
            logger.error("[GEMINI] erro de I/O ao baixar referência: url={}", url, e);
            throw new BusinessException("Falha ao baixar a imagem de referência.");
        }
    }

    private URI parseAndValidate(String url) {
        URI uri;
        try {
            uri = URI.create(url).normalize();
        } catch (IllegalArgumentException e) {
            throw new BusinessException("URL de referência inválida.");
        }

        String scheme = uri.getScheme();
        if (!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)) {
            throw new BusinessException("URL de referência inválida.");
        }

        if (!uri.toString().startsWith(storageService.publicBaseUrl() + "/")) {
            logger.warn("[SSRF] URL de referência recusada: {}", url);
            throw new BusinessException("A imagem de referência deve estar hospedada na plataforma.");
        }

        return uri;
    }

    private JsonNode findImageNode(JsonNode root) {
        if (root == null) {
            return null;
        }
        if (root.has("data") && "image".equals(root.path("type").asText())) {
            return root;
        }
        for (JsonNode child : root) {
            JsonNode found = findImageNode(child);
            if (found != null) {
                return found;
            }
        }
        return null;
    }


    private String postWithRetry(String payload) {
        int payloadKb = payload.length() / 1024;
        RuntimeException last = null;
        int timeoutAttempts = 0;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            long inicio = System.currentTimeMillis();
            try {
                String raw = restClient.post().body(payload).retrieve().body(String.class);
                logger.info("[GEMINI] ok em {}ms, payload={} KB",
                        System.currentTimeMillis() - inicio, payloadKb);
                return raw;
            } catch (RestClientResponseException e) {
                if (!RETRYABLE.contains(e.getStatusCode().value()) || isDailyQuotaExhausted(e)) {
                    throw e;
                }
                logger.warn("[GEMINI] {} em {}ms (tentativa {}/{}), payload={} KB",
                        e.getStatusCode().value(), System.currentTimeMillis() - inicio,
                        attempt, MAX_RETRIES, payloadKb);
                last = e;
            } catch (ResourceAccessException e) {
                logger.warn("[GEMINI] timeout apos {}ms (tentativa {}/{}), payload={} KB",
                        System.currentTimeMillis() - inicio, attempt, MAX_RETRIES, payloadKb);
                last = e;
                if (++timeoutAttempts >= MAX_TIMEOUT_ATTEMPTS) {
                    throw e;
                }
            }
            if (attempt < MAX_RETRIES) {
                sleepBackoff(attempt);
            }
        }
        throw last;
    }

    /** 429 de cota diária não adianta retentar — só volta a funcionar no dia seguinte. */
    private boolean isDailyQuotaExhausted(RestClientResponseException e) {
        if (e.getStatusCode().value() != 429) {
            return false;
        }
        String body = e.getResponseBodyAsString().toLowerCase();
        return body.contains("per day") || body.contains("perday") || body.contains("daily");
    }

    private void sleepBackoff(int attempt) {
        long delay = (long) (1000 * pow(2, attempt - 1)) + current().nextLong(250, 750);
        try {
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            currentThread().interrupt();
            throw new BusinessException("Requisição interrompida.");
        }
    }

}
