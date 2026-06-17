package com.venyx.tiktokshop.entities;

import jakarta.persistence.*;

import java.util.Objects;

/**
 * Stores hashed MFA recovery codes for a user.
 */
@Entity
@Table(name = "tb_user_recovery_code")
public class UserRecoveryCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String hashedCode;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    public UserRecoveryCode() {
    }

    public UserRecoveryCode(String hashedCode, User user) {
        this.hashedCode = hashedCode;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHashedCode() {
        return hashedCode;
    }

    public void setHashedCode(String hashedCode) {
        this.hashedCode = hashedCode;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserRecoveryCode that = (UserRecoveryCode) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
