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

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.lang.Math.abs;
import static java.lang.Math.log;
import static java.lang.Thread.currentThread;
import static java.net.http.HttpResponse.BodyHandlers.ofByteArray;
import static java.time.Duration.ofSeconds;
import static java.util.Base64.getDecoder;

/**
 * Mesmo modelo do {@link GeminiImageProvider} (Nano Banana 2), servido pela fal.
 *
 * <p>A diferença que importa não é de modelo, é de fila: o endpoint publico do AI Studio
 * entrega a mesma geracao em 55 a 270s, a fal em ~13s. E aqui as referencias vao por URL,
 * o que tira o download, a normalizacao e o payload em base64 do caminho critico.
 */
@Component
@ConditionalOnProperty(name = "venyx.image-provider", havingValue = "fal")
public class FalImageProvider implements ImageProvider {

    private static final Logger logger = LoggerFactory.getLogger(FalImageProvider.class);

    private static final int MAX_RETRIES = 3;
    private static final Set<Integer> RETRYABLE = Set.of(429, 500, 502, 503, 504);

    private static final List<String> SUPPORTED_ASPECTS =
            List.of("21:9", "16:9", "3:2", "4:3", "5:4", "1:1", "4:5", "3:4", "2:3", "9:16");

    private final RestClient restClient;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String editModel;
    private final String createModel;
    private final String aspectRatio;
    private final String resolution;
    private final String outputFormat;

    public FalImageProvider(ObjectMapper objectMapper,
                            @Value("${venyx.fal.api-key}") String apiKey,
                            @Value("${venyx.fal.base-url:https://fal.run}") String baseUrl,
                            @Value("${venyx.fal.edit-model:fal-ai/nano-banana-2/edit}") String editModel,
                            @Value("${venyx.fal.create-model:fal-ai/nano-banana-2}") String createModel,
                            @Value("${venyx.fal.timeout-seconds:120}") int timeoutSeconds,
                            @Value("${venyx.fal.image-aspect-ratio:9:16}") String aspectRatio,
                            @Value("${venyx.fal.image-size:1K}") String resolution,
                            @Value("${venyx.fal.output-format:jpeg}") String outputFormat) {
        this.objectMapper = objectMapper;
        this.editModel = editModel.trim();
        this.createModel = createModel.trim();
        this.aspectRatio = aspectRatio.trim();
        this.resolution = resolution.trim();
        this.outputFormat = outputFormat.trim();

        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory();
        factory.setReadTimeout(ofSeconds(timeoutSeconds));

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(ofSeconds(10))
                .build();

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Key " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();

        logger.info("[FAL] provider ativo: edit={}, create={}, aspect={}, size={}",
                this.editModel, this.createModel, this.aspectRatio, this.resolution);
    }

    @Override
    public ImageProviderResult generate(ImageProviderRequest request) {
        List<String> referencias = request.referenceImageUrls();
        boolean edicao = !referencias.isEmpty();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("prompt", request.prompt());
        if (edicao) {
            body.put("image_urls", referencias);
        }
        body.put("aspect_ratio", resolveAspectRatio(request));
        body.put("resolution", resolution);
        body.put("output_format", outputFormat);
        body.put("num_images", 1);
        body.put("sync_mode", true);

        String raw = postWithRetry(edicao ? editModel : createModel, body);
        JsonNode imagem = objectMapper.readTree(raw).path("images").path(0);
        if (imagem.isMissingNode()) {
            logger.error("[FAL] resposta sem imagem: {}", resumo(raw));
            throw new BusinessException("O provedor de imagem não retornou imagem.");
        }
        return readImage(imagem.path("url").asText());
    }

    private String postWithRetry(String model, Map<String, Object> body) {
        String payload = objectMapper.writeValueAsString(body);
        int payloadKb = payload.length() / 1024;
        RuntimeException last = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            long inicio = System.currentTimeMillis();
            try {
                String raw = restClient.post().uri("/" + model)
                        .body(payload).retrieve().body(String.class);
                logger.info("[FAL] ok em {}ms, modelo={}, payload={} KB",
                        System.currentTimeMillis() - inicio, model, payloadKb);
                return raw;
            } catch (RestClientResponseException e) {
                int status = e.getStatusCode().value();
                if (status == 401 || status == 403) {
                    logger.error("[FAL] credencial ou saldo recusados. status={} body={}",
                            status, resumo(e.getResponseBodyAsString()));
                    throw new BusinessException("Serviço de imagem indisponível. Tente novamente.");
                }
                if (!RETRYABLE.contains(status)) {
                    logger.error("[FAL] erro nao retentavel. status={} body={}",
                            status, resumo(e.getResponseBodyAsString()));
                    throw new BusinessException("Ocorreu um erro ao gerar a imagem. Tente novamente.");
                }
                logger.warn("[FAL] {} em {}ms, modelo={} (tentativa {}/{}), body={}",
                        status, System.currentTimeMillis() - inicio, model, attempt, MAX_RETRIES,
                        resumo(e.getResponseBodyAsString()));
                last = e;
            } catch (ResourceAccessException e) {
                logger.warn("[FAL] timeout apos {}ms, modelo={} (tentativa {}/{})",
                        System.currentTimeMillis() - inicio, model, attempt, MAX_RETRIES);
                last = e;
            }
            if (attempt < MAX_RETRIES) {
                sleepBackoff();
            }
        }
        logger.error("[FAL] esgotadas as {} tentativas no modelo {}", MAX_RETRIES, model, last);
        throw new BusinessException("O serviço de imagem está sobrecarregado. Tente novamente em instantes.");
    }

    /** Com sync_mode a imagem volta embutida; a URL hospedada fica como caminho alternativo. */
    private ImageProviderResult readImage(String url) {
        if (url.startsWith("data:")) {
            int virgula = url.indexOf(',');
            String mime = url.substring(5, url.indexOf(';'));
            return new ImageProviderResult(getDecoder().decode(url.substring(virgula + 1)), mime);
        }
        byte[] content = download(url, 30);
        return new ImageProviderResult(content, "image/" + outputFormat);
    }

    /**
     * A proporcao dos swaps sai da image 1 — pedir 9:16 para um frame que nao e 9:16 devolve
     * a cena recortada. Aqui a image 1 e baixada so para ser medida pelo cabecalho; o payload
     * continua indo por URL.
     */
    private String resolveAspectRatio(ImageProviderRequest request) {
        if (!request.matchFirstReferenceAspect() || request.referenceImageUrls().isEmpty()) {
            return aspectRatio;
        }
        double medido = readAspectRatio(download(request.referenceImageUrls().get(0), 15));
        if (medido <= 0) {
            logger.warn("[FAL] nao foi possivel medir a image 1; usando {}", aspectRatio);
            return aspectRatio;
        }

        String closest = aspectRatio;
        double best = Double.MAX_VALUE;
        for (String candidate : SUPPORTED_ASPECTS) {
            String[] parts = candidate.split(":");
            double value = Double.parseDouble(parts[0]) / Double.parseDouble(parts[1]);
            double distance = abs(log(medido / value));
            if (distance < best) {
                best = distance;
                closest = candidate;
            }
        }
        return closest;
    }

    private double readAspectRatio(byte[] content) {
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(content))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                return -1;
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(input);
                return reader.getHeight(0) <= 0 ? -1 : (double) reader.getWidth(0) / reader.getHeight(0);
            } finally {
                reader.dispose();
            }
        } catch (Exception e) {
            return -1;
        }
    }

    private byte[] download(String url, int timeoutSeconds) {
        HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                .timeout(ofSeconds(timeoutSeconds))
                .GET()
                .build();
        try {
            HttpResponse<byte[]> response = httpClient.send(req, ofByteArray());
            if (response.statusCode() != 200) {
                logger.error("[FAL] download falhou. status={} url={}", response.statusCode(), url);
                throw new BusinessException("Falha ao obter a imagem gerada.");
            }
            return response.body();
        } catch (InterruptedException e) {
            currentThread().interrupt();
            throw new BusinessException("Download da imagem interrompido.");
        } catch (Exception e) {
            logger.error("[FAL] erro de I/O no download: url={}", url, e);
            throw new BusinessException("Falha ao obter a imagem gerada.");
        }
    }

    private String resumo(String body) {
        if (body == null || body.isBlank()) {
            return "(vazio)";
        }
        String limpo = body.replaceAll("\\s+", " ").trim();
        return limpo.length() <= 300 ? limpo : limpo.substring(0, 300) + "...";
    }

    private void sleepBackoff() {
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            currentThread().interrupt();
            throw new BusinessException("Requisição interrompida.");
        }
    }
}
