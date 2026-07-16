package com.venyx.tiktokshop.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Expira assinaturas vencidas periodicamente, cortando o acesso de quem passou do
 * prazo (regra: assinatura acabou → não acessa mais o app). Roda a cada 5 minutos —
 * granularidade suficiente para acesso baseado em dias.
 */
@Component
public class SubscriptionScheduler {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionScheduler.class);

    private final SubscriptionService subscriptionService;

    public SubscriptionScheduler(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @Scheduled(fixedDelay = 300_000)
    public void expireOverdue() {
        try {
            int expired = subscriptionService.expireOverdue();
            if (expired > 0) {
                log.info("Assinaturas expiradas neste ciclo: {}", expired);
            }
        } catch (Exception ex) {
            log.warn("Falha ao expirar assinaturas vencidas: {}", ex.getMessage());
        }
    }
}
