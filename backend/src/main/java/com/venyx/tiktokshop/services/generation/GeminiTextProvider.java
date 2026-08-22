package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.services.exceptions.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.lang.Math.pow;
import static java.lang.Thread.currentThread;
import static java.util.concurrent.ThreadLocalRandom.current;

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

    private static final int MAX_ATTEMPTS_PER_MODEL = 2;
    /** Teto total. Melhor falhar em 1 min com mensagem que prender o usuário por 2. */
    private static final long TOTAL_BUDGET_MS = 70_000;
    private static final Set<Integer> RETRYABLE = Set.of(429, 500, 502, 503, 504);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String baseUrl;
    private final List<String> models;

    public GeminiTextProvider(ObjectMapper objectMapper,
                              @Value("${venyx.gemini.text-base-url}") String baseUrl,
                              @Value("${venyx.gemini.api-key}") String apiKey,
                              @Value("${venyx.gemini.text-model}") String model,
                              @Value("${venyx.gemini.text-fallback-models:}") String fallbackModels,
                              @Value("${venyx.gemini.text-timeout-seconds:30}") int timeoutSeconds) {
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
        this.models = buildChain(model, fallbackModels);

        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory();
        factory.setReadTimeout(ofSeconds(timeoutSeconds));

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .defaultHeader("x-goog-api-key", apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    private List<String> buildChain(String primary, String fallbacks) {
        List<String> chain = new ArrayList<>();
        chain.add(primary);
        for (String candidate : fallbacks.split(",")) {
            String trimmed = candidate.trim();
            if (!trimmed.isBlank() && !chain.contains(trimmed)) {
                chain.add(trimmed);
            }
        }
        logger.info("[GEMINI-TEXT] cadeia de modelos: {}", chain);
        return List.copyOf(chain);
    }

    @Override
    public TextProviderResult generate(TextProviderRequest request) {
        Map<String, Object> generationConfig = Map.of(
                "responseMimeType", request.jsonOutput() ? "application/json" : "text/plain");

        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", request.instruction())))),
                "generationConfig", generationConfig);

        String raw = requestWithRetry(objectMapper.writeValueAsString(body));

        String text = extractText(objectMapper.readTree(raw));
        if (text == null || text.isBlank()) {
            throw new BusinessException("Gemini não retornou texto.");
        }
        return new TextProviderResult(text);
    }

    /**
     * Duas tentativas por modelo e então cai para o próximo da cadeia: um 503
     * "high demand" é do modelo, não da chave, então insistir no mesmo não resolve.
     * O orçamento total impede que o usuário fique preso na tela.
     */
    private String requestWithRetry(String payload) {
        long deadline = System.currentTimeMillis() + TOTAL_BUDGET_MS;
        RuntimeException last = null;

        for (String candidate : models) {
            for (int attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
                if (System.currentTimeMillis() >= deadline) {
                    logger.error("[GEMINI-TEXT] orçamento de {}ms esgotado", TOTAL_BUDGET_MS, last);
                    throw new BusinessException("Serviço de IA sobrecarregado, tente novamente.");
                }

                long inicio = System.currentTimeMillis();
                try {
                    String raw = restClient.post()
                            .uri(baseUrl + "/" + candidate + ":generateContent")
                            .body(payload)
                            .retrieve()
                            .body(String.class);
                    logger.info("[GEMINI-TEXT] ok em {}ms, modelo={}, payload={} KB",
                            System.currentTimeMillis() - inicio, candidate, payload.length() / 1024);
                    return raw;
                } catch (RestClientResponseException e) {
                    if (e.getStatusCode().value() == 404) {
                        logger.warn("[GEMINI-TEXT] modelo {} indisponível (404), indo para o próximo da cadeia",
                                candidate);
                        last = e;
                        break;
                    }
                    if (!RETRYABLE.contains(e.getStatusCode().value())) {
                        throw e;
                    }
                    logger.warn("[GEMINI-TEXT] {} em {}ms, modelo={} (tentativa {}/{})",
                            e.getStatusCode().value(), System.currentTimeMillis() - inicio,
                            candidate, attempt, MAX_ATTEMPTS_PER_MODEL);
                    last = e;
                } catch (ResourceAccessException e) {
                    logger.warn("[GEMINI-TEXT] timeout apos {}ms, modelo={} (tentativa {}/{})",
                            System.currentTimeMillis() - inicio, candidate, attempt, MAX_ATTEMPTS_PER_MODEL);
                    last = e;
                }
                sleepBackoff(attempt);
            }
        }

        logger.error("[GEMINI-TEXT] cadeia {} esgotada", models, last);
        throw new BusinessException("Serviço de IA sobrecarregado, tente novamente.");
    }

    private void sleepBackoff(int attempt) {
        long delay = (long) (800 * pow(2, attempt - 1)) + current().nextLong(200, 600);
        try {
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            currentThread().interrupt();
            throw new BusinessException("Requisição interrompida.");
        }
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