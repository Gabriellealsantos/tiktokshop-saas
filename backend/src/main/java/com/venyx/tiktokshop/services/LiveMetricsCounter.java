package com.venyx.tiktokshop.services;

import org.springframework.stereotype.Component;

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

    private final AtomicLong views = new AtomicLong(0);
    private final AtomicLong clicks = new AtomicLong(0);

    /** A cada venda: alguns cliques geram a venda e muitas views a cercam. */
    public void bumpOnSale() {
        views.addAndGet(ThreadLocalRandom.current().nextLong(500, 2000));
        clicks.addAndGet(ThreadLocalRandom.current().nextLong(100, 500));
    }

    public long getViews() {
        return views.get();
    }

    public long getClicks() {
        return clicks.get();
    }

    public void reset() {
        views.set(0);
        clicks.set(0);
    }
}
