package com.venyx.tiktokshop.entities;

import com.venyx.tiktokshop.entities.enums.FlowType;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Exceção individual: libera um usuário específico da cota diária de um fluxo
 * (promoção, teste, cortesia). Nível mais específico da resolução — vence o
 * override de papel e o {@link DailyLimit} global.
 */
@Entity
@Table(name = "daily_limit_user_overrides",
        uniqueConstraints = @UniqueConstraint(name = "uk_user_override_flow_user",
                columnNames = {"flow_type", "user_id"}))
public class UserLimitOverride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "flow_type", length = 30, nullable = false)
    private FlowType flowType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private boolean unlimited;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    public UserLimitOverride() {
    }

    public UserLimitOverride(FlowType flowType, User user, boolean unlimited) {
        this.flowType = flowType;
        this.user = user;
        this.unlimited = unlimited;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FlowType getFlowType() {
        return flowType;
    }

    public void setFlowType(FlowType flowType) {
        this.flowType = flowType;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public boolean isUnlimited() {
        return unlimited;
    }

    public void setUnlimited(boolean unlimited) {
        this.unlimited = unlimited;
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
