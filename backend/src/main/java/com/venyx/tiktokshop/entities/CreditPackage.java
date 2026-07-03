package com.venyx.tiktokshop.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * Pacote de créditos à venda (tela /creditos). Preços definidos pelo admin.
 */
@Entity
@Table(name = "credit_packages")
public class CreditPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer credits;

    @Column(name = "bonus_pct")
    private Integer bonusPct = 0;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    private String badge;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant createdAt;

    public CreditPackage() {
    }

    public CreditPackage(String name, Integer credits, Integer bonusPct, BigDecimal price, String badge,
                         boolean active, Integer orderIndex) {
        this.name = name;
        this.credits = credits;
        this.bonusPct = bonusPct;
        this.price = price;
        this.badge = badge;
        this.active = active;
        this.orderIndex = orderIndex;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public Integer getBonusPct() {
        return bonusPct;
    }

    public void setBonusPct(Integer bonusPct) {
        this.bonusPct = bonusPct;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getBadge() {
        return badge;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CreditPackage that = (CreditPackage) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
