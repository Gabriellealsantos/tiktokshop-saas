package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.CreationSession;
import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.entities.enums.CreationStatus;
import com.venyx.tiktokshop.entities.enums.ImageGenerationStatus;
import com.venyx.tiktokshop.repositories.CreationSessionRepository;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
public class StudioGenerationTx {

    private final CreationSessionRepository sessionRepository;
    private final ImageGenerationRepository generationRepository;

    public StudioGenerationTx(CreationSessionRepository sessionRepository,
                              ImageGenerationRepository generationRepository) {
        this.sessionRepository = sessionRepository;
        this.generationRepository = generationRepository;
    }

    /** Marca RUNNING e devolve só o que a chamada ao Gemini precisa. Null = estado inconsistente. */
    @Transactional
    public StudioJobContext start(Long sessionId, Long jobId) {
        CreationSession session = sessionRepository.findByIdFetchingUser(sessionId).orElse(null);
        ImageGeneration job = generationRepository.findById(jobId).orElse(null);

        if (session == null || job == null || session.getStatus() != CreationStatus.GENERATING) {
            return null;
        }

        job.setStatus(ImageGenerationStatus.RUNNING);
        job.setUpdatedAt(Instant.now());
        generationRepository.save(job);

        return new StudioJobContext(
                session.getUser().getUuid(),
                job.getPrompt(),
                (String) session.getConfig().get("avatarImageUrl"),
                (String) session.getConfig().get("productImageUrl"));
    }

    @Transactional
    public CreationSession complete(Long sessionId, Long jobId, String imageUrl) {
        ImageGeneration job = generationRepository.findById(jobId).orElseThrow();
        job.setImageUrl(imageUrl);
        job.setStatus(ImageGenerationStatus.COMPLETED);
        job.setUpdatedAt(Instant.now());
        generationRepository.save(job);

        CreationSession session = sessionRepository.findByIdFetchingUser(sessionId).orElseThrow();
        session.getConfig().put("imageUrl", imageUrl);
        session.setStatus(CreationStatus.COMPLETED);
        return sessionRepository.save(session);
    }

    @Transactional
    public CreationSession fail(Long sessionId, Long jobId, String erro) {
        ImageGeneration job = generationRepository.findById(jobId).orElseThrow();
        job.setStatus(ImageGenerationStatus.FAILED);
        job.setError(erro);
        job.setUpdatedAt(Instant.now());
        generationRepository.save(job);

        CreationSession session = sessionRepository.findByIdFetchingUser(sessionId).orElseThrow();
        session.setStatus(CreationStatus.FAILED);
        session.getConfig().put("error", erro);
        return sessionRepository.save(session);
    }
}