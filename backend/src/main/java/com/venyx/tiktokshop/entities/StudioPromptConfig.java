package com.venyx.tiktokshop.entities;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "studio_prompt_config")
public class StudioPromptConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "prompt_instruction", columnDefinition = "TEXT", nullable = false)
    private String promptInstruction;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    public StudioPromptConfig() {}

    public Long getId() { return id; }
    public String getPromptInstruction() { return promptInstruction; }
    public void setPromptInstruction(String promptInstruction) { this.promptInstruction = promptInstruction; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public User getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(User updatedBy) { this.updatedBy = updatedBy; }
}