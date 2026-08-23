package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.entities.enums.ImageGenerationStatus;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
public class AvatarGenerationTx {

    private final ImageGenerationRepository repository;

    public AvatarGenerationTx(ImageGenerationRepository repository) {
        this.repository = repository;
    }

    /** Marca RUNNING e devolve só o que a chamada ao Gemini precisa. Null = job fora de PENDING. */
    @Transactional
    public AvatarJobContext start(Long jobId) {
        ImageGeneration job = repository.findByIdFetchingUser(jobId).orElse(null);
        if (job == null || job.getStatus() != ImageGenerationStatus.PENDING) {
            return null;
        }

        job.setStatus(ImageGenerationStatus.RUNNING);
        job.setUpdatedAt(Instant.now());
        repository.save(job);

        return new AvatarJobContext(job.getUser().getUuid(), job.getPrompt(), extractReferences(job));
    }

    @Transactional
    public ImageGeneration complete(Long jobId, String imageUrl) {
        ImageGeneration job = repository.findByIdFetchingUser(jobId).orElseThrow();
        job.setImageUrl(imageUrl);
        job.setStatus(ImageGenerationStatus.COMPLETED);
        job.setUpdatedAt(Instant.now());
        return repository.save(job);
    }

    @Transactional
    public ImageGeneration fail(Long jobId, String erro) {
        ImageGeneration job = repository.findByIdFetchingUser(jobId).orElseThrow();
        job.setStatus(ImageGenerationStatus.FAILED);
        job.setError(erro);
        job.setUpdatedAt(Instant.now());
        return repository.save(job);
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
