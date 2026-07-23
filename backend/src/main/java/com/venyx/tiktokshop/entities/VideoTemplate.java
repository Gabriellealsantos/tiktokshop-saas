package com.venyx.tiktokshop.entities;

import com.venyx.tiktokshop.entities.enums.VideoAudioMode;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

/**
 * Template de vídeo do fluxo de extração de movimento (tela /templates).
 *
 * <p>O {@code owner} define a visibilidade: {@code null} = template PÚBLICO (curado pelo
 * ADMIN, aparece para todos); preenchido = PRIVADO (upload manual do próprio usuário, só
 * aparece para ele).
 *
 * <p>Os campos de direção ({@code videoStyle}, {@code objective}, {@code tone}, {@code energy},
 * {@code duration}, {@code motionInstruction}) alimentam o prompt-engine (Veo3) via
 * {@code VideoPromptComposer}. Ficam nulos em uploads privados (sem curadoria) — o composer
 * cai num corpo default nesse caso.
 */
@Entity
@Table(name = "video_templates")
public class VideoTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String slug;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(length = 40)
    private String category;

    @Column(name = "thumbnail_url", length = 1024)
    private String thumbnailUrl;

    @Column(name = "video_url", nullable = false, length = 1024)
    private String videoUrl;

    /** null = público (admin); preenchido = privado daquele usuário. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(name = "video_style", length = 255)
    private String videoStyle;

    @Column(length = 255)
    private String objective;

    @Column(length = 120)
    private String tone;

    @Column(length = 120)
    private String energy;

    @Column(length = 60)
    private String duration;

    @Column(name = "motion_instruction", columnDefinition = "TEXT")
    private String motionInstruction;

    /** Camada de áudio/fala do prompt gerado (narração falada / música / silêncio). */
    @Enumerated(EnumType.STRING)
    @Column(name = "audio_mode", nullable = false, length = 20)
    private VideoAudioMode audioMode = VideoAudioMode.NARRACAO;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant createdAt;

    public VideoTemplate() {
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    /** true se o template é público (sem dono). */
    public boolean isPublicTemplate() {
        return owner == null;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public String getVideoStyle() {
        return videoStyle;
    }

    public void setVideoStyle(String videoStyle) {
        this.videoStyle = videoStyle;
    }

    public String getObjective() {
        return objective;
    }

    public void setObjective(String objective) {
        this.objective = objective;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }

    public String getEnergy() {
        return energy;
    }

    public void setEnergy(String energy) {
        this.energy = energy;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getMotionInstruction() {
        return motionInstruction;
    }

    public void setMotionInstruction(String motionInstruction) {
        this.motionInstruction = motionInstruction;
    }

    public VideoAudioMode getAudioMode() {
        return audioMode;
    }

    public void setAudioMode(VideoAudioMode audioMode) {
        this.audioMode = audioMode;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
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
        VideoTemplate that = (VideoTemplate) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}