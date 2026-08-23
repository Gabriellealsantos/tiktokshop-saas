package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.services.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AvatarGenerationProcessor {

    private static final Logger log = LoggerFactory.getLogger(AvatarGenerationProcessor.class);
    private static final String AVATAR_FOLDER = "avatars";

    private final ImageProvider imageProvider;
    private final StorageService storageService;
    private final AvatarGenerationNotifier notifier;
    private final AvatarGenerationTx avatarTx;

    public AvatarGenerationProcessor(ImageProvider imageProvider,
                                     StorageService storageService,
                                     AvatarGenerationNotifier notifier,
                                     AvatarGenerationTx avatarTx) {
        this.imageProvider = imageProvider;
        this.storageService = storageService;
        this.notifier = notifier;
        this.avatarTx = avatarTx;
    }

    @Async("avatarTaskExecutor")
    public void process(Long jobId) {
        long inicio = System.currentTimeMillis();
        log.info("[ASYNC-INÍCIO] jobId={} rodando na thread {}", jobId, Thread.currentThread().getName());

        AvatarJobContext ctx = avatarTx.start(jobId);
        if (ctx == null) {
            log.warn("[ASYNC-SKIP] jobId={} não está PENDING (job nulo ou status diferente), ignorando.", jobId);
            return;
        }
        log.info("[ASYNC-RUNNING] jobId={} status=RUNNING, chamando o provider de imagem...", jobId);

        ImageGeneration job;
        try {
            // Fora de transação: a chamada ao Gemini leva ~25s e nao pode segurar conexao do pool.
            ImageProviderResult result = imageProvider.generate(
                    new ImageProviderRequest(ctx.prompt(), ctx.references()));

            String imageUrl = storageService.uploadWithRetry(
                    result.content(), result.mimeType(), AVATAR_FOLDER + "/" + ctx.userUuid());

            job = avatarTx.complete(jobId, imageUrl);
            log.info("[ASYNC-COMPLETED] jobId={} imagem salva em: {}", jobId, imageUrl);
        } catch (Exception e) {
            log.error("[ASYNC-FAILED] jobId={} erro: {}", jobId, e.getMessage(), e);
            job = avatarTx.fail(jobId, e.getMessage());
        }

        notifier.notifyReady(ctx.userUuid(), job);

        log.info("[ASYNC-FIM] jobId={} finalizado (status={}) em {}ms na thread {}",
                jobId, job.getStatus(), System.currentTimeMillis() - inicio,
                Thread.currentThread().getName());
    }
}