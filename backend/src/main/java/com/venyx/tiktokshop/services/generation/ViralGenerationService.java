package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.ViralPromptRequestDTO;
import com.venyx.tiktokshop.dtos.ViralScriptDTO;
import com.venyx.tiktokshop.dtos.ViralScriptsRequestDTO;
import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.ViralCharacter;
import com.venyx.tiktokshop.entities.ViralFlowTemplate;
import com.venyx.tiktokshop.entities.ViralTone;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.GenerationLimitService;
import com.venyx.tiktokshop.services.ViralCatalogService;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.venyx.tiktokshop.entities.enums.FlowType.VIRAL_MODEL;
import static com.venyx.tiktokshop.entities.enums.ImageGenerationStatus.COMPLETED;
import static com.venyx.tiktokshop.entities.enums.ImageGenerationStatus.FAILED;

/**
 * Motor de geração viral em dois passos (saída de <b>texto</b>):
 * <ol>
 *   <li>{@link #generateScripts} — 3 roteiros (preview, não persiste, não consome cota).</li>
 *   <li>{@link #generatePrompt} — prompt final do vídeo; consome a cota diária de
 *       {@code VIRAL_MODEL} (independente do Avatar) e persiste um job em
 *       {@code image_generations} (reusa a infra do fluxo de imagem).</li>
 * </ol>
 */
@Service
public class ViralGenerationService {

    private static final Logger logger = LoggerFactory.getLogger(ViralGenerationService.class);

    private final ViralCatalogService catalog;
    private final ViralPromptComposer composer;
    private final TextProvider textProvider;
    private final GenerationLimitService limitService;
    private final AuthService authService;
    private final ImageGenerationRepository repository;
    private final ObjectMapper objectMapper;

    public ViralGenerationService(ViralCatalogService catalog,
                                  ViralPromptComposer composer,
                                  TextProvider textProvider,
                                  GenerationLimitService limitService,
                                  AuthService authService,
                                  ImageGenerationRepository repository,
                                  ObjectMapper objectMapper) {
        this.catalog = catalog;
        this.composer = composer;
        this.textProvider = textProvider;
        this.limitService = limitService;
        this.authService = authService;
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    /** Passo 1 — gera os 3 roteiros (não persiste, não consome cota). */
    public List<ViralScriptDTO> generateScripts(ViralScriptsRequestDTO req) {
        ViralFlowTemplate template = catalog.requireTemplate(req.templateSlug());
        ViralCharacter character = catalog.requireCharacter(template.getId(), req.characterSlug());
        ViralTone tone = catalog.requireTone(req.tone());

        String instruction = composer.composeScripts(template, character, tone);
        TextProviderResult result = textProvider.generate(new TextProviderRequest(instruction, true));

        return parseScripts(result.text());
    }

    /** Passo 2 — gera o prompt final e persiste o job (consome cota VIRAL_MODEL). */
    public ImageGeneration generatePrompt(ViralPromptRequestDTO req) {
        User user = authService.authenticated();
        limitService.assertCanGenerate(user.getUuid(), VIRAL_MODEL);

        ViralFlowTemplate template = catalog.requireTemplate(req.templateSlug());
        ViralCharacter character = catalog.requireCharacter(template.getId(), req.characterSlug());
        ViralTone tone = catalog.requireTone(req.tone());

        ImageGeneration job = new ImageGeneration();
        job.setUser(user);
        job.setFlowType(VIRAL_MODEL);
        job.getConfig().putAll(buildConfig(req));
        job.setCreatedAt(Instant.now());

        try {
            String instruction = composer.composeFinalPrompt(template, character, tone, req.script());
            TextProviderResult result = textProvider.generate(new TextProviderRequest(instruction, false));
            job.setPrompt(result.text().trim());
            job.setStatus(COMPLETED);
        } catch (Exception e) {
            logger.warn("[VIRAL] falha ao gerar prompt final: {}", e.getMessage());
            job.setStatus(FAILED);
            job.setError(e.getMessage());
        }

        return repository.save(job);
    }

    private Map<String, Object> buildConfig(ViralPromptRequestDTO req) {
        Map<String, Object> config = new LinkedHashMap<>();
        config.put("templateSlug", req.templateSlug());
        config.put("characterSlug", req.characterSlug());
        config.put("tone", req.tone());
        ViralScriptDTO script = req.script();
        config.put("scriptId", script.id());
        config.put("scriptTitle", script.title());
        config.put("scriptDescription", script.description());
        config.put("scriptQuote", script.quote());
        return config;
    }

    /** Extrai o array JSON da resposta (tolera cercas de markdown) e desserializa. */
    private List<ViralScriptDTO> parseScripts(String text) {
        String json = extractJsonArray(text);
        try {
            List<ViralScriptDTO> scripts =
                    objectMapper.readValue(json, new TypeReference<List<ViralScriptDTO>>() {});
            if (scripts == null || scripts.isEmpty()) {
                throw new BusinessException("A IA não retornou nenhum roteiro.");
            }
            return normalizeIds(scripts);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.warn("[VIRAL] resposta de roteiros inválida: {}", e.getMessage());
            throw new BusinessException("Falha ao interpretar os roteiros gerados pela IA.");
        }
    }

    private String extractJsonArray(String text) {
        if (text == null) {
            throw new BusinessException("A IA não retornou roteiros.");
        }
        int start = text.indexOf('[');
        int end = text.lastIndexOf(']');
        if (start < 0 || end <= start) {
            throw new BusinessException("Falha ao interpretar os roteiros gerados pela IA.");
        }
        return text.substring(start, end + 1);
    }

    private List<ViralScriptDTO> normalizeIds(List<ViralScriptDTO> scripts) {
        return java.util.stream.IntStream.range(0, scripts.size())
                .mapToObj(i -> {
                    ViralScriptDTO s = scripts.get(i);
                    String id = (s.id() == null || s.id().isBlank()) ? "script-" + (i + 1) : s.id();
                    return new ViralScriptDTO(id, s.title(), s.description(), s.quote());
                })
                .toList();
    }
}
