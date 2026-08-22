package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.entities.LiveSalesConfig;
import com.venyx.tiktokshop.entities.enums.LiveSalesMode;
import com.venyx.tiktokshop.repositories.LiveSalesConfigRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Tick de 5s que decide se é hora de estourar uma venda automática, lendo a
 * {@link com.venyx.tiktokshop.entities.LiveSalesConfig} a cada execução — assim
 * o admin liga/desliga e troca o intervalo em runtime sem precisar reiniciar
 * a aplicação (um {@code @Scheduled(fixedRate=...)} fixo não permitiria isso).
 * 5s (em vez de 1s) evita poluir o log com uma query repetida por segundo;
 * o disparo em si ainda respeita o intervalSeconds configurado pelo admin.
 */
@Component
public class LiveSalesScheduler {

    private static final Logger log = LoggerFactory.getLogger(LiveSalesScheduler.class);

    private static final int DEFAULT_INTERVAL_SECONDS = 8;

    private final LiveSalesService liveSalesService;
    private final LiveSalesConfigRepository configRepository;

    private final ConcurrentHashMap<UUID, Instant> lastFiredAtMap = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<UUID, Integer> nextIntervalMap = new ConcurrentHashMap<>();

    public LiveSalesScheduler(LiveSalesService liveSalesService, LiveSalesConfigRepository configRepository) {
        this.liveSalesService = liveSalesService;
        this.configRepository = configRepository;
    }

    @Scheduled(fixedDelay = 5000)
    public void tick() {
        List<LiveSalesConfig> configs = configRepository.findByModeFetchingUser(LiveSalesMode.AUTOMATIC);
        Instant now = Instant.now();

        for (LiveSalesConfig config : configs) {
            UUID userId = config.getUser().getUuid();
            Instant lastFiredAt = lastFiredAtMap.getOrDefault(userId, Instant.EPOCH);
            int nextInterval = nextIntervalMap.getOrDefault(userId, 0);

            if (now.isBefore(lastFiredAt.plusSeconds(nextInterval))) {
                continue;
            }

            try {
                liveSalesService.fireSaleForUser(userId, null);
                lastFiredAtMap.put(userId, now);
                nextIntervalMap.put(userId, resolveNextInterval(config));
            } catch (Exception ex) {
                log.warn("Falha ao disparar venda automática (user: {}): {}", userId, ex.getMessage());
            }
        }
    }

    private int resolveNextInterval(LiveSalesConfig config) {
        if (config.isRandomInterval()
                && config.getIntervalMinSeconds() != null && config.getIntervalMaxSeconds() != null) {
            int min = Math.max(1, config.getIntervalMinSeconds());
            int max = Math.max(min, config.getIntervalMaxSeconds());
            return ThreadLocalRandom.current().nextInt(min, max + 1);
        }
        return config.getIntervalSeconds() != null ? config.getIntervalSeconds() : DEFAULT_INTERVAL_SECONDS;
    }
}
