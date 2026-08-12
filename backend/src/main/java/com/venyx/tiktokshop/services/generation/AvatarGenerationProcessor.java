package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.entities.enums.ImageGenerationStatus;
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
public class AvatarGenerationProcessor {

    private static final Logger log = LoggerFactory.getLogger(AvatarGenerationProcessor.class);
    private static final String AVATAR_FOLDER = "avatars";

    private final ImageGenerationRepository repository;
    private final ImageProvider imageProvider;
    private final StorageService storageService;
    private final AvatarGenerationNotifier notifier;

    public AvatarGenerationProcessor(ImageGenerationRepository repository,
                                     ImageProvider imageProvider,
                                     StorageService storageService,
                                     AvatarGenerationNotifier notifier) {
        this.repository = repository;
        this.imageProvider = imageProvider;
        this.storageService = storageService;
        this.notifier = notifier;
    }

    @Async("avatarTaskExecutor")
    @Transactional
    public void process(Long jobId) {
        long inicio = System.currentTimeMillis();
        log.info("[ASYNC-INÍCIO] jobId={} rodando na thread {}", jobId, Thread.currentThread().getName());

        ImageGeneration job = repository.findByIdFetchingUser(jobId).orElse(null);
        if (job == null || job.getStatus() != ImageGenerationStatus.PENDING) {
            log.warn("[ASYNC-SKIP] jobId={} não está PENDING (job nulo ou status diferente), ignorando.", jobId);
            return;
        }

        UUID userUuid = job.getUser().getUuid();
        try {
            job.setStatus(ImageGenerationStatus.RUNNING);
            job.setUpdatedAt(Instant.now());
            repository.save(job);
            log.info("[ASYNC-RUNNING] jobId={} status=RUNNING, chamando o provider de imagem...", jobId);

            ImageProviderResult result = imageProvider.generate(
                    new ImageProviderRequest(job.getPrompt(), extractReferences(job)));

            String imageUrl = storageService.uploadWithRetry(
                    result.content(), result.mimeType(), AVATAR_FOLDER + "/" + userUuid);

            job.setImageUrl(imageUrl);
            job.setStatus(ImageGenerationStatus.COMPLETED);
            log.info("[ASYNC-COMPLETED] jobId={} imagem salva em: {}", jobId, imageUrl);
        } catch (Exception e) {
            log.error("[ASYNC-FAILED] jobId={} erro: {}", jobId, e.getMessage(), e);
            job.setStatus(ImageGenerationStatus.FAILED);
            job.setError(e.getMessage());
        }

        job.setUpdatedAt(Instant.now());
        repository.save(job);
        notifier.notifyReady(userUuid, job);

        long duracao = System.currentTimeMillis() - inicio;
        log.info("[ASYNC-FIM] jobId={} finalizado (status={}) em {}ms na thread {}",
                jobId, job.getStatus(), duracao, Thread.currentThread().getName());
    }

    @SuppressWarnings("unchecked")
    private List<String> extractReferences(ImageGeneration job) {
        Object refs = job.getConfig().get("references");
        if (refs instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return List.of();
    }
}
