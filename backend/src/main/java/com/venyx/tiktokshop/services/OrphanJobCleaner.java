package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.entities.enums.ImageGenerationStatus;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Limpa jobs órfãos (PENDING/RUNNING) que ficaram presos — ex.: backend reiniciou
 * durante a geração. Marca como FAILED para que o frontend não fique esperando eternamente.
 * Segue o padrão de LiveSalesScheduler/NotificationScheduler.
 */
@Component
public class OrphanJobCleaner {

    private static final Logger logger = LoggerFactory.getLogger(OrphanJobCleaner.class);
    private static final int ORPHAN_THRESHOLD_MINUTES = 30;

    private final ImageGenerationRepository repository;

    public OrphanJobCleaner(ImageGenerationRepository repository) {
        this.repository = repository;
    }

    @Scheduled(fixedDelay = 300_000)
    @Transactional
    public void cleanOrphans() {
        Instant threshold = Instant.now().minus(ORPHAN_THRESHOLD_MINUTES, ChronoUnit.MINUTES);
        int updated = repository.markOrphansAsFailed(threshold, Instant.now());
        if (updated > 0) {
            logger.info("[ORPHAN-CLEANER] {} job(s) órfão(s) marcado(s) como FAILED", updated);
        }
    }
}
