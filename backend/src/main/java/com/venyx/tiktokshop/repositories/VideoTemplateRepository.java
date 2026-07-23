package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.VideoTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VideoTemplateRepository extends JpaRepository<VideoTemplate, Long> {

    /**
     * Galeria do usuário: públicos (sem dono) + os privados do próprio usuário.
     * Filtro opcional por categoria (passe {@code null} para todas).
     */
    @Query("""
            SELECT t FROM VideoTemplate t
            WHERE t.active = true
              AND (t.owner IS NULL OR t.owner.uuid = :uuid)
              AND (:category IS NULL OR t.category = :category)
            ORDER BY t.sortOrder ASC, t.id ASC
            """)
    List<VideoTemplate> findGallery(@Param("uuid") UUID uuid, @Param("category") String category);

    Optional<VideoTemplate> findBySlugAndActiveTrue(String slug);

    /** Admin: apenas templates públicos (dono nulo), inclusive inativos. */
    List<VideoTemplate> findAllByOwnerIsNullOrderBySortOrderAscIdAsc();

    boolean existsBySlug(String slug);
}