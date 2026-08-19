package com.venyx.tiktokshop.entities;

import com.venyx.tiktokshop.entities.enums.LiveSalesMode;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;
import java.util.List;
import java.util.ArrayList;
import com.venyx.tiktokshop.entities.enums.LiveSalesSource;

/**
 * Configuração de pop-ups de "vendas ao vivo" por usuário (OPC-4).
 * {@code mode} controla o disparo: DISABLED (parado), MANUAL (só via
 * {@code POST /api/admin/live-sales/fire}) ou AUTOMATIC (job em {@code intervalSeconds}).
 */
@Entity
@Table(name = "live_sales_config")
public class LiveSalesConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LiveSalesMode mode = LiveSalesMode.DISABLED;

    @Column(name = "interval_seconds")
    private Integer intervalSeconds;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false)
    private LiveSalesSource sourceType = LiveSalesSource.RANDOM;

    @Column(name = "category_id")
    private Long categoryId;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "live_sales_config_products",
        joinColumns = @JoinColumn(name = "config_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private List<Product> adminProducts = new ArrayList<>();

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public LiveSalesSource getSourceType() {
        return sourceType;
    }

    public void setSourceType(LiveSalesSource sourceType) {
        this.sourceType = sourceType;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public List<Product> getAdminProducts() {
        return adminProducts;
    }

    public void setAdminProducts(List<Product> adminProducts) {
        this.adminProducts = adminProducts;
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
