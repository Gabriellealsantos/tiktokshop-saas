package com.venyx.tiktokshop.entities;

import com.venyx.tiktokshop.entities.enums.FlowType;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Libera um papel inteiro (ADM, afiliado, cliente) da cota diária de um fluxo.
 * Nível intermediário da resolução: usuário > papel > {@link DailyLimit} global.
 */
@Entity
@Table(name = "daily_limit_role_overrides",
        uniqueConstraints = @UniqueConstraint(name = "uk_role_override_flow_role",
                columnNames = {"flow_type", "role_id"}))
public class RoleLimitOverride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "flow_type", length = 30, nullable = false)
    private FlowType flowType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(nullable = false)
    private boolean unlimited;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    public RoleLimitOverride() {
    }

    public RoleLimitOverride(FlowType flowType, Role role, boolean unlimited) {
        this.flowType = flowType;
        this.role = role;
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

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
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
