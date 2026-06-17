package com.venyx.tiktokshop.entities;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tb_email_confirmation")
public class EmailConfirmation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID uuid;

    @Column(nullable = false, unique = true, length = 100)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_uuid", nullable = false)
    private User user;

    @Column(nullable = false)
    private Instant expiration;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public EmailConfirmation() {}

    public EmailConfirmation(User user, Instant expiration) {
        this.token = UUID.randomUUID().toString();
        this.user = user;
        this.expiration = expiration;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }

    public boolean isExpired() {
        return Instant.now().isAfter(this.expiration);
    }

    public boolean isUsed() {
        return this.confirmedAt != null;
    }

    // Getters e Setters
    public UUID getUuid() { return uuid; }
    public String getToken() { return token; }
    public User getUser() { return user; }
    public Instant getExpiration() { return expiration; }
    public Instant getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(Instant confirmedAt) { this.confirmedAt = confirmedAt; }
    public Instant getCreatedAt() { return createdAt; }
}