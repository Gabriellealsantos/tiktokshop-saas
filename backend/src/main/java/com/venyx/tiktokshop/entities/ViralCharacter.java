package com.venyx.tiktokshop.entities;

import jakarta.persistence.*;

import java.util.Objects;

/**
 * Personagem/objeto de um {@link ViralFlowTemplate}. A {@code description} é a
 * direção visual de cena usada na composição do prompt (ex.: "idoso em triciclo…").
 */
@Entity
@Table(name = "viral_characters",
        uniqueConstraints = @UniqueConstraint(columnNames = {"template_id", "slug"}))
public class ViralCharacter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "template_id", nullable = false)
    private ViralFlowTemplate template;

    @Column(nullable = false, length = 60)
    private String slug;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "image_url", length = 1024)
    private String imageUrl;

    /** Seção dentro do template: "vovo"/"vova" na Novelinha, "objeto"/"fruta" nos Objetos. */
    @Column(length = 50)
    private String subcategory;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Column(nullable = false)
    private boolean active = true;

    public ViralCharacter() {
    }

    public Long getId() {
        return id;
    }

    public ViralFlowTemplate getTemplate() {
        return template;
    }

    public void setTemplate(ViralFlowTemplate template) {
        this.template = template;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getSubcategory() {
        return subcategory;
    }

    public void setSubcategory(String subcategory) {
        this.subcategory = subcategory;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ViralCharacter that = (ViralCharacter) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
