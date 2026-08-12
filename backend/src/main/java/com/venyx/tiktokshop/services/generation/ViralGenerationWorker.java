package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.GenerationResultMessage;
import com.venyx.tiktokshop.dtos.ViralScriptDTO;
import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.ViralCharacter;
import com.venyx.tiktokshop.entities.ViralFlowTemplate;
import com.venyx.tiktokshop.entities.ViralTone;
import com.venyx.tiktokshop.entities.enums.ImageGenerationStatus;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.stream.IntStream;

import static com.venyx.tiktokshop.entities.enums.ImageGenerationStatus.*;

/**
 * Worker assíncrono para gerações do fluxo viral (Trend Boost).
 * Bean separado do service para evitar self-invocation que anula o proxy @Async.
 */
@Component
public class ViralGenerationWorker {

    private static final Logger logger = LoggerFactory.getLogger(ViralGenerationWorker.class);
    private static final String WS_DESTINATION = "/queue/generation";

    private final ViralPromptComposer composer;
    private final TextProvider textProvider;
    private final ImageGenerationRepository repository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public ViralGenerationWorker(ViralPromptComposer composer,
                                 TextProvider textProvider,
                                 ImageGenerationRepository repository,
                                 SimpMessagingTemplate messagingTemplate,
                                 ObjectMapper objectMapper) {
        this.composer = composer;
        this.textProvider = textProvider;
        this.repository = repository;
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Gera 3 roteiros virais (não persiste job, não consome cota).
     * Envia resultado via WS com type=VIRAL_SCRIPTS.
     */
    @Async("generationExecutor")
    public void runScripts(User user, String correlationId,
                           ViralFlowTemplate template, ViralCharacter character, ViralTone tone) {
        try {
            String instruction = composer.composeScripts(template, character, tone);
            TextProviderResult result = textProvider.generate(new TextProviderRequest(instruction, true));
            List<ViralScriptDTO> scripts = parseScripts(result.text());

            sendToUser(user, new GenerationResultMessage(
                    correlationId, "VIRAL_SCRIPTS", COMPLETED, scripts, null));
        } catch (Exception e) {
            logger.warn("[VIRAL-ASYNC] falha ao gerar roteiros: {}", e.getMessage());
            sendToUser(user, new GenerationResultMessage(
                    correlationId, "VIRAL_SCRIPTS", FAILED, null, e.getMessage()));
        }
    }

    /**
     * Gera prompt final do vídeo (persiste job, consome cota VIRAL_MODEL).
     * Envia resultado via WS com type=VIRAL_PROMPT.
     */
    @Async("generationExecutor")
    public void runPrompt(User user, Long jobId,
                          ViralFlowTemplate template, ViralCharacter character,
                          ViralTone tone, ViralScriptDTO script) {
        ImageGeneration job = repository.findById(jobId).orElse(null);
        if (job == null) return;

        job.setStatus(RUNNING);
        repository.save(job);

        try {
            String instruction = composer.composeFinalPrompt(template, character, tone, script);
            TextProviderResult result = textProvider.generate(new TextProviderRequest(instruction, false));
            job.setPrompt(result.text().trim());
            job.setStatus(COMPLETED);
            repository.save(job);

            sendToUser(user, new GenerationResultMessage(
                    jobId.toString(), "VIRAL_PROMPT", COMPLETED, job.getPrompt(), null));
        } catch (Exception e) {
            logger.warn("[VIRAL-ASYNC] falha ao gerar prompt final: {}", e.getMessage());
            job.setStatus(FAILED);
            job.setError(e.getMessage());
            repository.save(job);

            sendToUser(user, new GenerationResultMessage(
                    jobId.toString(), "VIRAL_PROMPT", FAILED, null, e.getMessage()));
        }
    }

    private void sendToUser(User user, GenerationResultMessage msg) {
        messagingTemplate.convertAndSendToUser(
                user.getUuid().toString(), WS_DESTINATION, msg);
    }

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
            logger.warn("[VIRAL-ASYNC] resposta de roteiros inválida: {}", e.getMessage());
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
        return IntStream.range(0, scripts.size())
                .mapToObj(i -> {
                    ViralScriptDTO s = scripts.get(i);
                    String id = (s.id() == null || s.id().isBlank()) ? "script-" + (i + 1) : s.id();
                    return new ViralScriptDTO(id, s.title(), s.description(), s.quote());
                })
                .toList();
    }
}
