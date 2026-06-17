package com.venyx.tiktokshop.entities;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

/**
 * Password recovery token entity.
 */
@Entity
@Table(name = "tb_password_recover")
public class PasswordRecover {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String token;

    @Column(nullable = false)
    private Instant expiration;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public PasswordRecover() {
    }

    public PasswordRecover(Long id, String token, Instant expiration) {
        this.id = id;
        this.token = token;
        this.expiration = expiration;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Instant getExpiration() {
        return expiration;
    }

    public void setExpiration(Instant expiration) {
        this.expiration = expiration;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        PasswordRecover that = (PasswordRecover) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
