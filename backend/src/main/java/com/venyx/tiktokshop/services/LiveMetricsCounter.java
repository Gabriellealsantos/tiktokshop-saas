package com.venyx.tiktokshop.services;

import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Contadores em memória de visualizações e cliques de produto, incrementados a
 * cada venda ao vivo para dar a sensação de tempo real (como as Vendas ao Vivo).
 * São somados à base cadastrada pelo admin na leitura do dashboard. Voláteis por
 * design: reiniciam com a aplicação (o número "cheio" vem da base cadastrada).
 */
@Component
public class LiveMetricsCounter {

    private final ConcurrentHashMap<UUID, AtomicLong> views = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<UUID, AtomicLong> clicks = new ConcurrentHashMap<>();

    /** A cada venda: alguns cliques geram a venda e muitas views a cercam. */
    public void bumpOnSale(UUID userId) {
        views.computeIfAbsent(userId, k -> new AtomicLong(0))
             .addAndGet(ThreadLocalRandom.current().nextLong(500, 2000));
        clicks.computeIfAbsent(userId, k -> new AtomicLong(0))
              .addAndGet(ThreadLocalRandom.current().nextLong(100, 500));
    }

    public long getViews(UUID userId) {
        AtomicLong v = views.get(userId);
        return v != null ? v.get() : 0L;
    }

    public long getClicks(UUID userId) {
        AtomicLong c = clicks.get(userId);
        return c != null ? c.get() : 0L;
    }

    public void reset(UUID userId) {
        views.remove(userId);
        clicks.remove(userId);
    }
}
