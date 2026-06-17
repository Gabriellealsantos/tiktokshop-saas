package com.venyx.tiktokshop.entities;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

/**
 * Progresso de conclusão de uma aula por um usuário (OPC-3, opcional).
 */
@Entity
@Table(name = "lesson_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "lesson_id"}))
public class LessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private AcademyLesson lesson;

    @Column(name = "completed_at", columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant completedAt;

    public LessonProgress() {
    }

    public LessonProgress(User user, AcademyLesson lesson) {
        this.user = user;
        this.lesson = lesson;
        this.completedAt = Instant.now();
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

    public AcademyLesson getLesson() {
        return lesson;
    }

    public void setLesson(AcademyLesson lesson) {
        this.lesson = lesson;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LessonProgress that = (LessonProgress) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
