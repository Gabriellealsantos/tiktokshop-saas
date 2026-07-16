package com.venyx.tiktokshop.entities;

import com.venyx.tiktokshop.entities.enums.LiveSalesMode;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

/**
 * Configuração global dos pop-ups de "vendas ao vivo" (prova social) (OPC-4).
 * {@code mode} controla o disparo: DISABLED (parado), MANUAL (só via
 * {@code POST /api/admin/live-sales/fire}) ou AUTOMATIC (job em {@code intervalSeconds}).
 */
@Entity
@Table(name = "live_sales_config")
public class LiveSalesConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LiveSalesMode mode = LiveSalesMode.DISABLED;

    @Column(name = "interval_seconds")
    private Integer intervalSeconds;

    @Column(name = "random_interval", nullable = false)
    private boolean randomInterval = false;

    @Column(name = "interval_min_seconds")
    private Integer intervalMinSeconds;

    @Column(name = "interval_max_seconds")
    private Integer intervalMaxSeconds;

    @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant updatedAt;

    public LiveSalesConfig() {
    }

    @PrePersist
    @PreUpdate
    public void touch() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LiveSalesMode getMode() {
        return mode;
    }

    public void setMode(LiveSalesMode mode) {
        this.mode = mode;
    }

    public Integer getIntervalSeconds() {
        return intervalSeconds;
    }

    public void setIntervalSeconds(Integer intervalSeconds) {
        this.intervalSeconds = intervalSeconds;
    }

    public boolean isRandomInterval() {
        return randomInterval;
    }

    public void setRandomInterval(boolean randomInterval) {
        this.randomInterval = randomInterval;
    }

    public Integer getIntervalMinSeconds() {
        return intervalMinSeconds;
    }

    public void setIntervalMinSeconds(Integer intervalMinSeconds) {
        this.intervalMinSeconds = intervalMinSeconds;
    }

    public Integer getIntervalMaxSeconds() {
        return intervalMaxSeconds;
    }

    public void setIntervalMaxSeconds(Integer intervalMaxSeconds) {
        this.intervalMaxSeconds = intervalMaxSeconds;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LiveSalesConfig that = (LiveSalesConfig) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
