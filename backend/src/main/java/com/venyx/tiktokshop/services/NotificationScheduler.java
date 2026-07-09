package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.CreateNotificationDTO;
import com.venyx.tiktokshop.entities.NotificationSchedule;
import com.venyx.tiktokshop.repositories.NotificationScheduleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Tick de 5s que dispara as campanhas recorrentes. Diferente do LiveSalesScheduler, o
 * lastFiredAt é persistido na própria campanha (não em memória), então a cadência sobrevive
 * a reinícios. Lê o estado a cada tick — o admin liga/desliga e troca o intervalo em runtime.
 */
@Component
public class NotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificationScheduler.class);

    private final NotificationScheduleRepository scheduleRepository;
    private final NotificationService notificationService;

    public NotificationScheduler(NotificationScheduleRepository scheduleRepository,
                                 NotificationService notificationService) {
        this.scheduleRepository = scheduleRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedDelay = 5000)
    public void tick() {
        for (NotificationSchedule s : scheduleRepository.findByActiveTrue()) {
            Instant last = s.getLastFiredAt() != null ? s.getLastFiredAt() : Instant.EPOCH;
            if (Instant.now().isBefore(last.plusSeconds(s.getIntervalSeconds()))) {
                continue;
            }
            try {
                notificationService.createAndDispatch(fromSchedule(s), s.getCreatedBy());
                s.setLastFiredAt(Instant.now());
                scheduleRepository.save(s);
            } catch (Exception e) {
                log.warn("Falha ao disparar campanha {}: {}", s.getId(), e.getMessage());
            }
        }
    }

    private CreateNotificationDTO fromSchedule(NotificationSchedule s) {
        // Campanhas são broadcast (ALL); SELECTED não é suportado por agenda (não há targets persistidos).
        return new CreateNotificationDTO(
                s.getType(),
                s.getTitle(),
                s.getBody(),
                s.getImageUrl(),
                s.getClickUrl(),
                s.getAudience(),
                null);
    }
}
