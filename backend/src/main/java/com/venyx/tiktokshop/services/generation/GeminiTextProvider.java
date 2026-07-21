package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.services.exceptions.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

import static java.time.Duration.ofSeconds;

/**
 * Provider de texto real via Google Gemini (endpoint {@code :generateContent}).
 * Segue o mesmo padrão de {@link GeminiImageProvider}: {@code RestClient} com
 * header {@code x-goog-api-key}, ativado por {@code venyx.text-provider=gemini}.
 */
@Component
@ConditionalOnProperty(name = "venyx.text-provider", havingValue = "gemini")
public class GeminiTextProvider implements TextProvider {

    private static final Logger logger = LoggerFactory.getLogger(GeminiTextProvider.class);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String baseUrl;
    private final String model;

    public GeminiTextProvider(ObjectMapper objectMapper,
                              @Value("${venyx.gemini.text-base-url}") String baseUrl,
                              @Value("${venyx.gemini.api-key}") String apiKey,
                              @Value("${venyx.gemini.text-model}") String model,
                              @Value("${venyx.gemini.timeout-seconds}") int timeoutSeconds) {
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
        this.model = model;

        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory();
        factory.setReadTimeout(ofSeconds(timeoutSeconds));

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .defaultHeader("x-goog-api-key", apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Override
    public TextProviderResult generate(TextProviderRequest request) {
        Map<String, Object> generationConfig = Map.of(
                "responseMimeType", request.jsonOutput() ? "application/json" : "text/plain");

        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", request.instruction())))),
                "generationConfig", generationConfig);

        String payload = objectMapper.writeValueAsString(body);

        String raw = restClient.post()
                .uri(baseUrl + "/" + model + ":generateContent")
                .body(payload)
                .retrieve()
                .body(String.class);

        logger.debug("[GEMINI-TEXT] resposta recebida ({} bytes)", raw.length());

        String text = extractText(objectMapper.readTree(raw));
        if (text == null || text.isBlank()) {
            throw new BusinessException("Gemini não retornou texto.");
        }
        return new TextProviderResult(text);
    }

    /** candidates[0].content.parts[*].text concatenado. */
    private String extractText(JsonNode root) {
        JsonNode parts = root.path("candidates").path(0).path("content").path("parts");
        if (!parts.isArray()) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        for (JsonNode part : parts) {
            sb.append(part.path("text").asText(""));
        }
        return sb.toString();
    }
}
