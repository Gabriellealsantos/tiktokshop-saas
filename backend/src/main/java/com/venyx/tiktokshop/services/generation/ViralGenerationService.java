package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.DailyUsageDTO;
import com.venyx.tiktokshop.dtos.PendingJobDTO;
import com.venyx.tiktokshop.dtos.ViralPromptRequestDTO;
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
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import static com.venyx.tiktokshop.entities.enums.FlowType.VIRAL_MODEL;
import static com.venyx.tiktokshop.entities.enums.ImageGenerationStatus.PENDING;

/**
 * Motor de geração viral em dois passos — agora assíncrono.
 * <p>
 * Os métodos públicos resolvem User, cota e catálogo sincronamente (thread do Tomcat),
 * retornam imediatamente com um jobId/correlationId, e delegam o trabalho pesado
 * (chamada ao Gemini) ao {@link ViralGenerationWorker} via @Async.
 * </p>
 * <ol>
 *   <li>{@link #generateScripts} — não persiste job, não consome cota (preview). Usa correlationId.</li>
 *   <li>{@link #generatePrompt} — persiste job PENDING, consome cota VIRAL_MODEL. Usa job.id.</li>
 * </ol>
 */
@Service
public class ViralGenerationService {

    private final ViralCatalogService catalog;
    private final GenerationLimitService limitService;
    private final AuthService authService;
    private final ImageGenerationRepository repository;
    private final ViralGenerationWorker worker;

    public ViralGenerationService(ViralCatalogService catalog,
                                  GenerationLimitService limitService,
                                  AuthService authService,
                                  ImageGenerationRepository repository,
                                  ViralGenerationWorker worker) {
        this.catalog = catalog;
        this.limitService = limitService;
        this.authService = authService;
        this.repository = repository;
        this.worker = worker;
    }

    /** Passo 1 — enfileira geração de 3 roteiros (não persiste, não consome cota). */
    public PendingJobDTO generateScripts(ViralScriptsRequestDTO req) {
        User user = authService.authenticated();
        ViralFlowTemplate template = catalog.requireTemplate(req.templateSlug());
        ViralCharacter character = catalog.requireCharacter(template.getId(), req.characterSlug());
        ViralTone tone = catalog.requireTone(req.tone());

        String correlationId = UUID.randomUUID().toString();
        worker.runScripts(user, correlationId, template, character, tone);
        return new PendingJobDTO(correlationId);
    }

    /** Passo 2 — enfileira geração do prompt final (persiste job PENDING, consome cota). */
    public PendingJobDTO generatePrompt(ViralPromptRequestDTO req) {
        User user = authService.authenticated();
        limitService.assertCanGenerate(user.getUuid(), VIRAL_MODEL);

        ViralFlowTemplate template = catalog.requireTemplate(req.templateSlug());
        ViralCharacter character = catalog.requireCharacter(template.getId(), req.characterSlug());
        ViralTone tone = catalog.requireTone(req.tone());

        ImageGeneration job = new ImageGeneration();
        job.setUser(user);
        job.setFlowType(VIRAL_MODEL);
        job.getConfig().putAll(buildConfig(req));
        job.setStatus(PENDING);
        job.setCreatedAt(Instant.now());
        job = repository.save(job);

        worker.runPrompt(user, job.getId(), template, character, tone, req.script());
        return new PendingJobDTO(job.getId());
    }

    private Map<String, Object> buildConfig(ViralPromptRequestDTO req) {
        Map<String, Object> config = new LinkedHashMap<>();
        config.put("templateSlug", req.templateSlug());
        config.put("characterSlug", req.characterSlug());
        config.put("tone", req.tone());
        var script = req.script();
        config.put("scriptId", script.id());
        config.put("scriptTitle", script.title());
        config.put("scriptDescription", script.description());
        config.put("scriptQuote", script.quote());
        return config;
    }
}
