package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.LiveSalesConfigDTO;
import com.venyx.tiktokshop.entities.enums.LiveSalesMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
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

    private volatile Instant lastFiredAt = Instant.EPOCH;
    private volatile int nextIntervalSeconds = 0;

    public LiveSalesScheduler(LiveSalesService liveSalesService) {
        this.liveSalesService = liveSalesService;
    }

    @Scheduled(fixedDelay = 5000)
    public void tick() {
        LiveSalesConfigDTO config = liveSalesService.getConfig();
        if (config.mode() != LiveSalesMode.AUTOMATIC) {
            return;
        }
        Instant now = Instant.now();
        if (now.isBefore(lastFiredAt.plusSeconds(nextIntervalSeconds))) {
            return;
        }
        try {
            liveSalesService.fireSale(null);
            lastFiredAt = now;
            // Sorteia o intervalo até a PRÓXIMA venda agora, para ficar estável entre os ticks.
            nextIntervalSeconds = resolveNextInterval(config);
        } catch (Exception ex) {
            log.warn("Falha ao disparar venda ao vivo automática: {}", ex.getMessage());
        }
    }

    /** Intervalo aleatório na faixa [min, max] quando habilitado; senão, o intervalo fixo. */
    private int resolveNextInterval(LiveSalesConfigDTO config) {
        if (Boolean.TRUE.equals(config.randomInterval())
                && config.intervalMinSeconds() != null && config.intervalMaxSeconds() != null) {
            int min = Math.max(1, config.intervalMinSeconds());
            int max = Math.max(min, config.intervalMaxSeconds());
            return ThreadLocalRandom.current().nextInt(min, max + 1);
        }
        return config.intervalSeconds() != null ? config.intervalSeconds() : DEFAULT_INTERVAL_SECONDS;
    }
}
