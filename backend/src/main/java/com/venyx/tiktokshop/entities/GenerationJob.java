package com.venyx.tiktokshop.entities;

import com.venyx.tiktokshop.entities.enums.GenerationJobType;
import com.venyx.tiktokshop.entities.enums.GenerationStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * Job de geração assíncrona (Estúdio, Avatares, Trend Boost, Ferramentas, TokEditor).
 * Débito de crédito acontece antes da geração; em falha, o estorno referencia credit_tx_id.
 */
@Entity
@Table(name = "generation_jobs")
public class GenerationJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GenerationJobType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GenerationStatus status = GenerationStatus.PENDING;

    @Column(name = "reference_id")
    private String referenceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_tx_id")
    private CreditTransaction creditTransaction;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> payload = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> result;

    @Column(columnDefinition = "TEXT")
    private String error;

    @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant createdAt;

    @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant updatedAt;

    public GenerationJob() {
    }

    public GenerationJob(User user, GenerationJobType type, String referenceId, Map<String, Object> payload) {
        this.user = user;
        this.type = type;
        this.referenceId = referenceId;
        if (payload != null) {
            this.payload = payload;
        }
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    public void preUpdate() {
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

    public GenerationJobType getType() {
        return type;
    }

    public void setType(GenerationJobType type) {
        this.type = type;
    }

    public GenerationStatus getStatus() {
        return status;
    }

    public void setStatus(GenerationStatus status) {
        this.status = status;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public CreditTransaction getCreditTransaction() {
        return creditTransaction;
    }

    public void setCreditTransaction(CreditTransaction creditTransaction) {
        this.creditTransaction = creditTransaction;
    }

    public Map<String, Object> getPayload() {
        return payload;
    }

    public void setPayload(Map<String, Object> payload) {
        this.payload = payload;
    }

    public Map<String, Object> getResult() {
        return result;
    }

    public void setResult(Map<String, Object> result) {
        this.result = result;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GenerationJob that = (GenerationJob) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
