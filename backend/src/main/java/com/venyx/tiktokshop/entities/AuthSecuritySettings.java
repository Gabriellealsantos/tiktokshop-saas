package com.venyx.tiktokshop.entities;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

/**
 * Configuração global de segurança de autenticação (singleton, 1 linha).
 * {@code singleSessionEnforced} liga o bloqueio de sessão simultânea para
 * <b>todas</b> as contas: enquanto alguém estiver com sessão ativa, um segundo
 * login na mesma conta é recusado.
 */
@Entity
@Table(name = "auth_security_settings")
public class AuthSecuritySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "single_session_enforced", nullable = false)
    private boolean singleSessionEnforced = false;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant updatedAt;

    public AuthSecuritySettings() {
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

    public boolean isSingleSessionEnforced() {
        return singleSessionEnforced;
    }

    public void setSingleSessionEnforced(boolean singleSessionEnforced) {
        this.singleSessionEnforced = singleSessionEnforced;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AuthSecuritySettings that = (AuthSecuritySettings) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}