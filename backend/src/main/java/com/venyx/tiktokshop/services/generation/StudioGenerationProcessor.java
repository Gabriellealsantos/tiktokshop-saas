package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.CreationSession;
import com.venyx.tiktokshop.services.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class StudioGenerationProcessor {

    private static final Logger log = LoggerFactory.getLogger(StudioGenerationProcessor.class);
    private static final String STUDIO_FOLDER = "studio";

    private final ImageProvider imageProvider;
    private final StorageService storageService;
    private final StudioGenerationNotifier notifier;
    private final StudioGenerationTx studioTx;

    public StudioGenerationProcessor(ImageProvider imageProvider,
                                     StorageService storageService,
                                     StudioGenerationNotifier notifier,
                                     StudioGenerationTx studioTx) {
        this.imageProvider = imageProvider;
        this.storageService = storageService;
        this.notifier = notifier;
        this.studioTx = studioTx;
    }

    @Async("studioTaskExecutor")
    public void process(Long sessionId, Long jobId) {
        long inicio = System.currentTimeMillis();
        log.info("[STUDIO-ASYNC-INÍCIO] sessionId={} jobId={} na thread {}",
                sessionId, jobId, Thread.currentThread().getName());

        StudioJobContext ctx = studioTx.start(sessionId, jobId);
        if (ctx == null) {
            log.warn("[STUDIO-ASYNC-SKIP] sessionId={} jobId={} inconsistente, ignorando.", sessionId, jobId);
            return;
        }

        CreationSession session;
        try {
            // Fora de transação: a chamada ao Gemini leva ~25s e nao pode segurar conexao do pool.
            ImageProviderResult result = imageProvider.generate(
                    ImageProviderRequest.of(ctx.prompt(), ctx.avatarImageUrl(), ctx.productImageUrl()));

            String imageUrl = storageService.uploadWithRetry(
                    result.content(), result.mimeType(), STUDIO_FOLDER + "/" + ctx.userUuid());

            session = studioTx.complete(sessionId, jobId, imageUrl);
        } catch (Exception e) {
            log.error("[STUDIO-ASYNC-FAILED] sessionId={} jobId={} erro: {}", sessionId, jobId, e.getMessage(), e);
            session = studioTx.fail(sessionId, jobId, e.getMessage());
        }

        notifier.notifyReady(ctx.userUuid(), session);

        log.info("[STUDIO-ASYNC-FIM] sessionId={} finalizado (status={}) em {}ms na thread {}",
                sessionId, session.getStatus(), System.currentTimeMillis() - inicio,
                Thread.currentThread().getName());
    }
}
