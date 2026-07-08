package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.LiveSalesConfigDTO;
import com.venyx.tiktokshop.entities.enums.LiveSalesMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

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

    private final LiveSalesService liveSalesService;

    private volatile Instant lastFiredAt = Instant.EPOCH;

    public LiveSalesScheduler(LiveSalesService liveSalesService) {
        this.liveSalesService = liveSalesService;
    }

    @Scheduled(fixedDelay = 5000)
    public void tick() {
        LiveSalesConfigDTO config = liveSalesService.getConfig();
        if (config.mode() != LiveSalesMode.AUTOMATIC) {
            return;
        }
        int intervalSeconds = config.intervalSeconds() != null ? config.intervalSeconds() : 8;
        Instant now = Instant.now();
        if (now.isBefore(lastFiredAt.plusSeconds(intervalSeconds))) {
            return;
        }
        try {
            liveSalesService.fireSale(null);
            lastFiredAt = now;
        } catch (Exception ex) {
            log.warn("Falha ao disparar venda ao vivo automática: {}", ex.getMessage());
        }
    }
}
