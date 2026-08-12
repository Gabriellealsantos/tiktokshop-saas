package com.venyx.tiktokshop.config;

import com.venyx.tiktokshop.repositories.CreationSessionRepository;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
public class StuckGenerationSweeper {

    private static final Logger log = LoggerFactory.getLogger(StuckGenerationSweeper.class);
    private static final String REASON = "Geração interrompida por reinício do servidor.";

    private final ImageGenerationRepository repository;
    private final CreationSessionRepository sessionRepository;

    public StuckGenerationSweeper(ImageGenerationRepository repository, CreationSessionRepository sessionRepository) {
        this.repository = repository;
        this.sessionRepository = sessionRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void sweepOnStartup() {
        int jobs = repository.failStuckJobs(REASON, Instant.now());
        if (jobs > 0) {
            log.warn("Sweeper: {} geração(ões) presa(s) em PENDING/RUNNING marcada(s) como FAILED no boot.", jobs);
        } else {
            log.info("Sweeper: nenhuma geração presa encontrada no boot.");
        }

        int sessions = sessionRepository.failStuckSessions(Instant.now());
        if (sessions > 0) {
            log.warn("Sweeper: {} sessão(ões) de estúdio presa(s) em GENERATING marcada(s) como FAILED no boot.", sessions);
        } else {
            log.info("Sweeper: nenhuma sessão de estúdio presa encontrada no boot.");
        }
    }
}
