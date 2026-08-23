package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.GenerationResultMessage;
import com.venyx.tiktokshop.dtos.ImageGenerationDTO;
import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import com.venyx.tiktokshop.services.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import static com.venyx.tiktokshop.entities.enums.ImageGenerationStatus.*;

/**
 * Worker assíncrono para swaps de imagem do fluxo de extração de movimento (tela /templates).
 * Bean separado do service para evitar self-invocation que anula o proxy @Async.
 */
@Component
public class VideoTemplateSwapWorker {

    private static final Logger logger = LoggerFactory.getLogger(VideoTemplateSwapWorker.class);
    private static final String WS_DESTINATION = "/queue/generation";
    private static final String RESULT_FOLDER = "templates";

    private final ImageGenerationRepository repository;
    private final ImageProvider imageProvider;
    private final StorageService storageService;
    private final SimpMessagingTemplate messagingTemplate;

    public VideoTemplateSwapWorker(ImageGenerationRepository repository,
                                   ImageProvider imageProvider,
                                   StorageService storageService,
                                   SimpMessagingTemplate messagingTemplate) {
        this.repository = repository;
        this.imageProvider = imageProvider;
        this.storageService = storageService;
        this.messagingTemplate = messagingTemplate;
    }

    @Async("generationExecutor")
    public void runSwapPerson(User user, Long jobId, String prompt,
                              String frameUrl, String avatarImageUrl, String avatarBodyImageUrl) {
        String[] references = (avatarBodyImageUrl == null || avatarBodyImageUrl.isBlank())
                ? new String[]{frameUrl, avatarImageUrl}
                : new String[]{frameUrl, avatarImageUrl, avatarBodyImageUrl};
        runSwap(user, jobId, prompt, "SWAP_PERSON", references);
    }

    @Async("generationExecutor")
    public void runSwapClothes(User user, Long jobId, String prompt, String... references) {
        runSwap(user, jobId, prompt, "SWAP_CLOTHES", references);
    }

    private void runSwap(User user, Long jobId, String prompt, String type, String... references) {
        ImageGeneration job = repository.findById(jobId).orElse(null);
        if (job == null) return;

        job.setStatus(RUNNING);
        repository.save(job);

        try {
            ImageProviderResult result = imageProvider.generate(ImageProviderRequest.of(prompt, references));
            String folder = RESULT_FOLDER + "/" + user.getUuid();
            job.setImageUrl(storageService.uploadWithRetry(result.content(), result.mimeType(), folder));
            job.setStatus(COMPLETED);
            repository.save(job);

            sendToUser(user, new GenerationResultMessage(
                    jobId.toString(), type, COMPLETED, new ImageGenerationDTO(job), null));
        } catch (Exception e) {
            logger.warn("[SWAP-ASYNC] falha no {}: {}", type, e.getMessage());
            job.setStatus(FAILED);
            job.setError(e.getMessage());
            repository.save(job);

            sendToUser(user, new GenerationResultMessage(
                    jobId.toString(), type, FAILED, null, e.getMessage()));
        }
    }

    private void sendToUser(User user, GenerationResultMessage msg) {
        messagingTemplate.convertAndSendToUser(
                user.getUuid().toString(), WS_DESTINATION, msg);
    }
}
