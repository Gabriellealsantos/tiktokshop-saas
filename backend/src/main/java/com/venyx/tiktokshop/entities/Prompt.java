package com.venyx.tiktokshop.entities;

import com.venyx.tiktokshop.entities.enums.PromptCategory;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

/**
 * Prompt pronto da galeria, copiável pelo usuário (OPC-1).
 */
@Entity
@Table(name = "prompts")
public class Prompt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    private PromptCategory category;

    @Column(name = "created_by_admin")
    private boolean createdByAdmin = true;

    @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant createdAt;

    public Prompt() {
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public PromptCategory getCategory() {
        return category;
    }

    public void setCategory(PromptCategory category) {
        this.category = category;
    }

    public boolean isCreatedByAdmin() {
        return createdByAdmin;
    }

    public void setCreatedByAdmin(boolean createdByAdmin) {
        this.createdByAdmin = createdByAdmin;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Prompt prompt = (Prompt) o;
        return Objects.equals(id, prompt.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
