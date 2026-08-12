package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.ImageGeneration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface ImageGenerationRepository extends JpaRepository<ImageGeneration, Long> {

    @Query(nativeQuery = true, value = """
    SELECT COUNT(*) FROM image_generations
    WHERE user_id = :userId AND flow_type = :flowType AND parent_id IS NULL
      AND status <> 'FAILED'
      AND created_at >= :dayStart AND created_at < :dayEnd
    """)
    long countFinalsToday(UUID userId, String flowType, Instant dayStart, Instant dayEnd);

    @Query(nativeQuery = true, value = """
    SELECT COUNT(*) FROM image_generations
    WHERE parent_id = :parentId AND status <> 'FAILED'
    """)
    long countRegenerations(Long parentId);

    Optional<ImageGeneration> findByIdAndUser_Uuid(Long id, UUID userId);
}