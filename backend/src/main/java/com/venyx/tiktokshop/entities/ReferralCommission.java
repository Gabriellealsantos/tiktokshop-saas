package com.venyx.tiktokshop.entities;

import com.venyx.tiktokshop.entities.enums.CommissionStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * Comissão gerada por uma indicação confirmada (OPC-5).
 */
@Entity
@Table(name = "referral_commissions")
public class ReferralCommission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referral_id", nullable = false)
    private Referral referral;

    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "split_pct")
    private Integer splitPct;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommissionStatus status = CommissionStatus.PENDING;

    @Column(name = "paid_at", columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant paidAt;

    @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant createdAt;

    public ReferralCommission() {
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

    public Referral getReferral() {
        return referral;
    }

    public void setReferral(Referral referral) {
        this.referral = referral;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Integer getSplitPct() {
        return splitPct;
    }

    public void setSplitPct(Integer splitPct) {
        this.splitPct = splitPct;
    }

    public CommissionStatus getStatus() {
        return status;
    }

    public void setStatus(CommissionStatus status) {
        this.status = status;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(Instant paidAt) {
        this.paidAt = paidAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ReferralCommission that = (ReferralCommission) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
