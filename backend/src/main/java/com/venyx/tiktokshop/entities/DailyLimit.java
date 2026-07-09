package com.venyx.tiktokshop.entities;

import com.venyx.tiktokshop.entities.enums.FlowType;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "daily_limits")
public class DailyLimit {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "flow_type", length = 30)
    private FlowType flowType;

    @Column(name = "max_per_day", nullable = false)
    private Integer maxPerDay;

    @Column(name = "max_regenerations", nullable = false)
    private Integer maxRegenerations;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    public DailyLimit() {
    }

    public FlowType getFlowType() {
        return flowType;
    }

    public void setFlowType(FlowType flowType) {
        this.flowType = flowType;
    }

    public Integer getMaxPerDay() {
        return maxPerDay;
    }

    public void setMaxPerDay(Integer maxPerDay) {
        this.maxPerDay = maxPerDay;
    }

    public Integer getMaxRegenerations() {
        return maxRegenerations;
    }

    public void setMaxRegenerations(Integer maxRegenerations) {
        this.maxRegenerations = maxRegenerations;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(User updatedBy) {
        this.updatedBy = updatedBy;
    }
}
