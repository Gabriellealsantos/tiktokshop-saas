package com.venyx.tiktokshop.entities;

import com.venyx.tiktokshop.entities.enums.CreditTransactionReason;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

/**
 * Histórico de movimentações de crédito de uma carteira (+/-).
 */
@Entity
@Table(name = "credit_transactions")
public class CreditTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CreditTransactionReason reason;

    private String referenceId;

    @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private CreditWallet wallet;

    public CreditTransaction() {
    }

    public CreditTransaction(CreditWallet wallet, Integer amount, CreditTransactionReason reason, String referenceId) {
        this.wallet = wallet;
        this.amount = amount;
        this.reason = reason;
        this.referenceId = referenceId;
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

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public CreditTransactionReason getReason() {
        return reason;
    }

    public void setReason(CreditTransactionReason reason) {
        this.reason = reason;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public CreditWallet getWallet() {
        return wallet;
    }

    public void setWallet(CreditWallet wallet) {
        this.wallet = wallet;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        CreditTransaction that = (CreditTransaction) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
