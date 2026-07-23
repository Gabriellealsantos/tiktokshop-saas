package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.services.StorageService;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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

    private final RestClient restClient;
    private final StorageService storageService;
    private final String model;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiImageProvider(StorageService storageService,
                               ObjectMapper objectMapper,
                               @Value("${venyx.gemini.base-url}") String baseUrl,
                               @Value("${venyx.gemini.api-key}") String apiKey,
                               @Value("${venyx.gemini.model}") String model,
                               @Value("${venyx.gemini.timeout-seconds}") int timeoutSeconds) {
        this.storageService = storageService;
        this.objectMapper = objectMapper;
        this.model = model;

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
                "input", buildInput(request));

        String payload = objectMapper.writeValueAsString(body);

        String raw = restClient.post()
                .body(payload)
                .retrieve()
                .body(String.class);

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
            byte[] reference = downloadReference(url);
            input.add(Map.of(
                    "type", "image",
                    "mime_type", "image/png",
                    "data", getEncoder().encodeToString(reference)));
        }
        return input;
    }

    private byte[] downloadReference(String url) {
        URI uri = parseAndValidate(url);
        HttpRequest request = HttpRequest.newBuilder(uri).GET().build();

        try {
            HttpResponse<byte[]> response = httpClient.send(request, ofByteArray());
            if (response.statusCode() != 200) {
                throw new BusinessException("Falha ao baixar a imagem de referência.");
            }
            return response.body();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("Download da imagem de referência interrompido.");
        } catch (IOException e) {
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

}
