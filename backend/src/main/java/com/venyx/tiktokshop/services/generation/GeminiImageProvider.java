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

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

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

    private static final int MAX_RETRIES = 2;
    /** Um timeout pode significar que o Gemini processou e cobrou. Insistir gasta cota. */
    private static final int MAX_TIMEOUT_ATTEMPTS = 2;
    private static final Set<Integer> RETRYABLE = Set.of(429, 500, 502, 503, 504);

    /** Proporções que a API aceita. A medida da image 1 é encaixada na mais próxima destas. */
    private static final List<String> SUPPORTED_ASPECTS =
            List.of("1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9");

    private static final Set<String> BLOCK_MARKERS = Set.of("safety violation", "prohibited content");

    /** Congestionamento do modelo: repetir nele em seguida devolve o mesmo 500. */
    private static final String HIGH_DEMAND = "experiencing high demand";

    /** Teto do job inteiro. Passar disso, ninguem mais quer a imagem: melhor falhar com mensagem. */
    private static final long TOTAL_BUDGET_MS = 420_000;


    /** Modelos que rejeitam thinking_level. Descoberto no primeiro 400, lembrado no processo. */
    private final Set<String> semThinking = ConcurrentHashMap.newKeySet();

    private static final String THINKING_NAO_SUPORTADO = "thinking is not enabled for this model";

    private final RestClient restClient;
    private final StorageService storageService;
    private final List<String> models;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String aspectRatio;
    private final String imageSize;
    private final String thinkingLevel;
    private final String imageMimeType;
    private final ImageNormalizer imageNormalizer;

    public GeminiImageProvider(StorageService storageService,
                               ObjectMapper objectMapper,
                               ImageNormalizer imageNormalizer,
                               @Value("${venyx.gemini.base-url}") String baseUrl,
                               @Value("${venyx.gemini.api-key}") String apiKey,
                               @Value("${venyx.gemini.model}") String model,
                               @Value("${venyx.gemini.image-fallback-models:}") String fallbackModels,
                               @Value("${venyx.gemini.image-timeout-seconds:240}") int timeoutSeconds,
                               @Value("${venyx.gemini.image-aspect-ratio}") String aspectRatio,
                               @Value("${venyx.gemini.image-size:1K}") String imageSize,
                               @Value("${venyx.gemini.thinking-level:high}") String thinkingLevel,
                               @Value("${venyx.gemini.image-mime-type:image/jpeg}") String imageMimeType) {
        this.storageService = storageService;
        this.imageNormalizer = imageNormalizer;
        this.objectMapper = objectMapper;
        this.models = buildChain(model, fallbackModels);
        this.aspectRatio = aspectRatio;
        this.imageSize = imageSize;
        this.thinkingLevel = thinkingLevel.trim();
        this.imageMimeType = imageMimeType.trim();

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
        // As referências são baixadas UMA vez: a proporção de saída é lida da image 1 e os
        // mesmos bytes seguem para o payload, sem um segundo download só para medir.
        List<byte[]> references = downloadReferences(request.referenceImageUrls());

        Map<String, Object> body = Map.of(
                "input", buildInput(request.prompt(), references),
                "generation_config", Map.of("thinking_level", thinkingLevel),
                "response_format", Map.of(
                        "type", "image",
                        "mime_type", imageMimeType,
                        "aspect_ratio", resolveAspectRatio(request, references),
                        "image_size", imageSize));

        String raw;
        try {
            raw = postWithRetry(body);
        } catch (RestClientResponseException e) {

            logger.error("[GEMINI] Falha na API. Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString());

            if (isDailyQuotaExhausted(e)) {
                throw new BusinessException("O limite diário de gerações de imagem foi atingido. As gerações voltam amanhã.");
            }
            if (e.getStatusCode().is5xxServerError() || e.getStatusCode().value() == 429) {
                throw new BusinessException("A Inteligência Artificial do Google (Gemini) está sobrecarregada no momento. Por favor, tente novamente em alguns instantes.");
            }

            if (isContentBlocked(e)) {
                throw new BusinessException("A imagem foi bloqueada pelo filtro de conteúdo do Google. "
                        + "Troque a foto de referência ou ajuste a descrição e tente de novo.");
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


    /**
     * O storage guarda a imagem em resolução cheia, mas o payload da API não precisa dela:
     * 2048px já bastam para o modelo e cortam o tamanho da requisição em várias vezes. Sem
     * isso, uma geração 2K reenviada como referência sozinha passa de 2MB.
     */
    private List<byte[]> downloadReferences(List<String> urls) {
        List<byte[]> references = new ArrayList<>(urls.size());
        for (String url : urls) {
            references.add(imageNormalizer.toReferenceJpeg(downloadReference(url)));
        }
        return references;
    }

    private List<Map<String, Object>> buildInput(String prompt, List<byte[]> references) {
        List<Map<String, Object>> input = new ArrayList<>();
        input.add(Map.of("type", "text", "text", prompt));

        // Ordem preservada: image 1, image 2, ... conforme a lista de referências.
        // Cada imagem é precedida por um rótulo textual: o prompt fala em "image 1/2/3", mas
        // as imagens chegavam como um array anônimo e o vínculo era puramente posicional.
        // O rótulo amarra explicitamente o número citado no texto à imagem que vem em seguida.
        int index = 1;
        for (byte[] reference : references) {
            input.add(Map.of("type", "text", "text", "IMAGE " + index++ + ":"));
            input.add(Map.of(
                    "type", "image",
                    "mime_type", "image/jpeg",
                    "data", getEncoder().encodeToString(reference)));
        }
        return input;
    }

    /**
     * Nos swaps a proporção sai da image 1: a cena precisa voltar com o mesmo enquadramento,
     * e pedir 9:16 para um clipe que não é 9:16 devolve a imagem recortada ou esticada. A
     * razão medida é encaixada na proporção suportada mais próxima (distância logarítmica,
     * para que o erro relativo pese igual nas duas pontas da lista). Se a medição falhar,
     * cai na proporção configurada em vez de derrubar a geração.
     */
    private String resolveAspectRatio(ImageProviderRequest request, List<byte[]> references) {
        if (!request.matchFirstReferenceAspect() || references.isEmpty()) {
            return aspectRatio;
        }

        double measured = readAspectRatio(references.get(0));
        if (measured <= 0) {
            logger.warn("[GEMINI] nao foi possivel medir a image 1; usando proporcao configurada {}", aspectRatio);
            return aspectRatio;
        }

        String closest = aspectRatio;
        double best = Double.MAX_VALUE;
        for (String candidate : SUPPORTED_ASPECTS) {
            String[] parts = candidate.split(":");
            double value = Double.parseDouble(parts[0]) / Double.parseDouble(parts[1]);
            double distance = Math.abs(Math.log(measured / value));
            if (distance < best) {
                best = distance;
                closest = candidate;
            }
        }

        if (!closest.equals(aspectRatio)) {
            logger.info("[GEMINI] proporcao derivada da image 1: {} (medido {})",
                    closest, String.format("%.4f", measured));
        }
        return closest;
    }

    /** Lê largura/altura pelo cabeçalho, sem decodificar a imagem inteira. Devolve -1 se falhar. */
    private double readAspectRatio(byte[] content) {
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(content))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                return -1;
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(input);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                return height <= 0 ? -1 : (double) width / height;
            } finally {
                reader.dispose();
            }
        } catch (Exception e) {
            return -1;
        }
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


    private String postWithRetry(Map<String, Object> body) {
        long deadline = System.currentTimeMillis() + TOTAL_BUDGET_MS;
        RuntimeException last = null;

        for (String candidate : models) {
            Map<String, Object> comModelo = new LinkedHashMap<>(body);
            comModelo.put("model", candidate);

            if (semThinking.contains(candidate)) {
                comModelo.remove("generation_config");
            }

            String payload = objectMapper.writeValueAsString(comModelo);
            int payloadKb = payload.length() / 1024;
            int timeoutAttempts = 0;

            for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                if (System.currentTimeMillis() >= deadline) {
                    logger.error("[GEMINI] orcamento de {}ms esgotado no modelo {}",
                            TOTAL_BUDGET_MS, candidate);
                    throw last != null ? last
                            : new BusinessException("A geração passou do tempo limite. Tente novamente.");
                }

                long inicio = System.currentTimeMillis();
                try {
                    String raw = restClient.post().body(payload).retrieve().body(String.class);
                    logger.info("[GEMINI] ok em {}ms, modelo={}, payload={} KB",
                            System.currentTimeMillis() - inicio, candidate, payloadKb);
                    return raw;
                } catch (RestClientResponseException e) {
                    if (e.getResponseBodyAsString().toLowerCase().contains(THINKING_NAO_SUPORTADO)
                            && comModelo.remove("generation_config") != null) {
                        semThinking.add(candidate);
                        payload = objectMapper.writeValueAsString(comModelo);
                        logger.warn("[GEMINI] modelo={} nao aceita thinking_level; refazendo sem ele", candidate);
                        continue;
                    }
                    if (!RETRYABLE.contains(e.getStatusCode().value()) || isDailyQuotaExhausted(e)) {
                        throw e;
                    }
                    logger.warn("[GEMINI] {} em {}ms, modelo={} (tentativa {}/{}), payload={} KB, body={}",
                            e.getStatusCode().value(), System.currentTimeMillis() - inicio, candidate,
                            attempt, MAX_RETRIES, payloadKb, resumo(e.getResponseBodyAsString()));
                    last = e;

                    if (e.getResponseBodyAsString().toLowerCase().contains(HIGH_DEMAND)) {
                        break;
                    }

                } catch (ResourceAccessException e) {
                    // Dois timeouts no mesmo modelo ja custaram minutos: o proximo da cadeia tem
                    // mais chance que uma terceira tentativa na mesma fila.
                    logger.warn("[GEMINI] timeout apos {}ms, modelo={} (tentativa {}/{}), payload={} KB",
                            System.currentTimeMillis() - inicio, candidate, attempt, MAX_RETRIES, payloadKb);
                    last = e;
                    if (++timeoutAttempts >= MAX_TIMEOUT_ATTEMPTS) {
                        break;
                    }
                }
                if (attempt < MAX_RETRIES) {
                    sleepBackoff(attempt);
                }
            }
        }
        throw last != null ? last
                : new BusinessException("A geração passou do tempo limite. Tente novamente.");
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

    /** Bloqueio de politica nao e transitorio: repetir a mesma entrada devolve o mesmo 400. */
    private boolean isContentBlocked(RestClientResponseException e) {
        if (e.getStatusCode().value() != 400) {
            return false;
        }
        String body = e.getResponseBodyAsString().toLowerCase();
        return BLOCK_MARKERS.stream().anyMatch(body::contains);
    }

    /**
     * O corpo do erro traz a causa real (deadline exceeded, internal, invalid argument).
     * Sem ele, um 500 sistematico fica indistinguivel de sobrecarga passageira.
     */
    private String resumo(String body) {
        if (body == null || body.isBlank()) {
            return "<vazio>";
        }
        String limpo = body.replaceAll("\\s+", " ").trim();
        return limpo.length() <= 300 ? limpo : limpo.substring(0, 300) + "...";
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
        logger.info("[GEMINI] cadeia de modelos de imagem: {}", chain);
        return List.copyOf(chain);
    }

}
