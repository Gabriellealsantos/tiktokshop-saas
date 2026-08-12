package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.GenerationResultMessage;
import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.VideoTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import static com.venyx.tiktokshop.entities.enums.ImageGenerationStatus.*;

/**
 * Worker assíncrono para geração de prompt Veo3 (tela /templates).
 * Não persiste job (não consome cota) — usa correlationId.
 * Bean separado do service para evitar self-invocation que anula o proxy @Async.
 */
@Component
public class VideoTemplatePromptWorker {

    private static final Logger logger = LoggerFactory.getLogger(VideoTemplatePromptWorker.class);
    private static final String WS_DESTINATION = "/queue/generation";

    private final VideoPromptComposer composer;
    private final TextProvider textProvider;
    private final SimpMessagingTemplate messagingTemplate;

    public VideoTemplatePromptWorker(VideoPromptComposer composer,
                                     TextProvider textProvider,
                                     SimpMessagingTemplate messagingTemplate) {
        this.composer = composer;
        this.textProvider = textProvider;
        this.messagingTemplate = messagingTemplate;
    }

    @Async("generationExecutor")
    public void runPrompt(User user, String correlationId,
                          VideoTemplate template, Product product) {
        try {
            String instruction = composer.compose(template, product);
            TextProviderResult result = textProvider.generate(new TextProviderRequest(instruction, false));

            String prompt = appendMotionScript(result.text().trim(), composer.resolveMotion(template));
            prompt = withFaceLock(prompt);

            messagingTemplate.convertAndSendToUser(
                    user.getUuid().toString(), WS_DESTINATION,
                    new GenerationResultMessage(correlationId, "VIDEO_PROMPT", COMPLETED, prompt, null));
        } catch (Exception e) {
            logger.warn("[PROMPT-ASYNC] falha ao gerar prompt Veo3: {}", e.getMessage());
            messagingTemplate.convertAndSendToUser(
                    user.getUuid().toString(), WS_DESTINATION,
                    new GenerationResultMessage(correlationId, "VIDEO_PROMPT", FAILED, null, e.getMessage()));
        }
    }

    private String appendMotionScript(String prompt, String motion) {
        return prompt
                + "\n\n## MOTION SCRIPT — the avatar performs EXACTLY this movement, beat by beat, "
                + "with these exact timings; do not deviate from, add to, or skip any beat:\n"
                + motion;
    }

    private String withFaceLock(String prompt) {
        return prompt + "\n\nFace lock: the avatar's face and identity come strictly from the "
                + "avatar reference image and must stay identical and unchanged for the entire "
                + "video — never alter, morph, beautify or swap the face.";
    }
}
