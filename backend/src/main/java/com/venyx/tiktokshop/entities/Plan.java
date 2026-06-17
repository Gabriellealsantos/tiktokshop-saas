package com.venyx.tiktokshop.entities;

import com.venyx.tiktokshop.entities.enums.PlanType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Plano de acesso à plataforma (mensal ou vitalício).
 */
@Entity
@Table(name = "plans")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanType type;

    private Integer durationDays;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    public Plan() {
    }

    public Plan(PlanType type, Integer durationDays, BigDecimal price) {
        this.type = type;
        this.durationDays = durationDays;
        this.price = price;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PlanType getType() {
        return type;
    }

    public void setType(PlanType type) {
        this.type = type;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Plan plan = (Plan) o;
        return Objects.equals(id, plan.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
