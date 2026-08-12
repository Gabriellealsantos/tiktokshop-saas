package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.CreationSession;
import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.entities.enums.CreationStatus;
import com.venyx.tiktokshop.entities.enums.ImageGenerationStatus;
import com.venyx.tiktokshop.repositories.CreationSessionRepository;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import com.venyx.tiktokshop.services.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class StudioGenerationProcessor {

    private static final Logger log = LoggerFactory.getLogger(StudioGenerationProcessor.class);
    private static final String STUDIO_FOLDER = "studio";

    private final CreationSessionRepository sessionRepository;
    private final ImageGenerationRepository generationRepository;
    private final ImageProvider imageProvider;
    private final StorageService storageService;
    private final StudioGenerationNotifier notifier;

    public StudioGenerationProcessor(CreationSessionRepository sessionRepository,
                                     ImageGenerationRepository generationRepository,
                                     ImageProvider imageProvider,
                                     StorageService storageService,
                                     StudioGenerationNotifier notifier) {
        this.sessionRepository = sessionRepository;
        this.generationRepository = generationRepository;
        this.imageProvider = imageProvider;
        this.storageService = storageService;
        this.notifier = notifier;
    }

    @Async("studioTaskExecutor")
    @Transactional
    public void process(Long sessionId, Long jobId) {
        long inicio = System.currentTimeMillis();
        log.info("[STUDIO-ASYNC-INÍCIO] sessionId={} jobId={} na thread {}",
                sessionId, jobId, Thread.currentThread().getName());

        CreationSession session = sessionRepository.findByIdFetchingUser(sessionId).orElse(null);
        ImageGeneration job = generationRepository.findById(jobId).orElse(null);

        if (session == null || job == null || session.getStatus() != CreationStatus.GENERATING) {
            log.warn("[STUDIO-ASYNC-SKIP] sessionId={} jobId={} inconsistente, ignorando.", sessionId, jobId);
            return;
        }

        UUID userUuid = session.getUser().getUuid();
        String avatarImageUrl = (String) session.getConfig().get("avatarImageUrl");
        String productImageUrl = (String) session.getConfig().get("productImageUrl");

        try {
            job.setStatus(ImageGenerationStatus.RUNNING);
            job.setUpdatedAt(Instant.now());
            generationRepository.save(job);

            ImageProviderResult result = imageProvider.generate(new ImageProviderRequest(
                    job.getPrompt(), List.of(avatarImageUrl, productImageUrl)));

            String imageUrl = storageService.uploadWithRetry(
                    result.content(), result.mimeType(), STUDIO_FOLDER + "/" + userUuid);

            job.setImageUrl(imageUrl);
            job.setStatus(ImageGenerationStatus.COMPLETED);
            generationRepository.save(job);

            session.getConfig().put("imageUrl", imageUrl);
            session.setStatus(CreationStatus.COMPLETED);
        } catch (Exception e) {
            log.error("[STUDIO-ASYNC-FAILED] sessionId={} jobId={} erro: {}", sessionId, jobId, e.getMessage(), e);
            job.setStatus(ImageGenerationStatus.FAILED);
            job.setError(e.getMessage());
            generationRepository.save(job);

            session.setStatus(CreationStatus.FAILED);
            session.getConfig().put("error", e.getMessage());
        }

        sessionRepository.save(session);
        notifier.notifyReady(userUuid, session);

        long duracao = System.currentTimeMillis() - inicio;
        log.info("[STUDIO-ASYNC-FIM] sessionId={} finalizado (status={}) em {}ms na thread {}",
                sessionId, session.getStatus(), duracao, Thread.currentThread().getName());
    }
}
