package com.venyx.tiktokshop.entities;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

/**
 * Template de geração viral (ex.: "Novelinha Viral", "Objetos Falantes").
 *
 * <p>O corpo do ".md" de instrução fica em {@code scriptInstruction} (gerar 3 roteiros)
 * e {@code promptInstruction} (gerar o prompt final do vídeo). Os placeholders são
 * preenchidos por {@code ViralPromptComposer} antes de enviar ao LLM.
 */
@Entity
@Table(name = "viral_flow_templates")
public class ViralFlowTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String slug;

    @Column(nullable = false, length = 120)
    private String title;

    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail_url", length = 1024)
    private String thumbnailUrl;

    @Column(name = "preview_video_url", length = 1024)
    private String previewVideoUrl;

    @Column(name = "script_instruction", columnDefinition = "TEXT", nullable = false)
    private String scriptInstruction;

    @Column(name = "prompt_instruction", columnDefinition = "TEXT", nullable = false)
    private String promptInstruction;

    /** Tag livre de agrupamento/filtro na vitrine (ex.: "POV"). Opcional. */
    @Column(length = 50)
    private String category;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant createdAt;

    public ViralFlowTemplate() {
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getPreviewVideoUrl() {
        return previewVideoUrl;
    }

    public void setPreviewVideoUrl(String previewVideoUrl) {
        this.previewVideoUrl = previewVideoUrl;
    }

    public String getScriptInstruction() {
        return scriptInstruction;
    }

    public void setScriptInstruction(String scriptInstruction) {
        this.scriptInstruction = scriptInstruction;
    }

    public String getPromptInstruction() {
        return promptInstruction;
    }

    public void setPromptInstruction(String promptInstruction) {
        this.promptInstruction = promptInstruction;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ViralFlowTemplate that = (ViralFlowTemplate) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
