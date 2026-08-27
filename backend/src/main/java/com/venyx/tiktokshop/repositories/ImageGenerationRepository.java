package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.ImageGeneration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Modifying
    @Query(nativeQuery = true, value = """
    UPDATE image_generations
       SET status = 'FAILED', error = 'Job órfão (timeout)', updated_at = :now
     WHERE status IN ('PENDING', 'RUNNING')
       AND updated_at < :threshold
    """)
    int markOrphansAsFailed(Instant threshold, Instant now);

    @Query("""
    SELECT g FROM ImageGeneration g
    JOIN FETCH g.user
    WHERE g.id = :id
    """)
    Optional<ImageGeneration> findByIdFetchingUser(Long id);

    @Modifying
    @Query(nativeQuery = true, value = """
    UPDATE image_generations
    SET status = 'FAILED',
        error = :reason,
        updated_at = :now
    WHERE status IN ('PENDING', 'RUNNING')
    """)
    int failStuckJobs(String reason, Instant now);

    @Query(nativeQuery = true, value = """
    SELECT COUNT(*) FROM image_generations
    WHERE status IN ('PENDING', 'RUNNING')
      AND updated_at < :threshold
    """)
    long countStuckSince(Instant threshold);

    /**
     * Lock consultivo por (usuario, fluxo), liberado automaticamente no commit. Serializa
     * apenas as verificacoes de limite do mesmo usuario no mesmo fluxo: sem ele, duas
     * requisicoes concorrentes leem a mesma contagem e ambas passam pelo teto diario.
     */
    @Query(value = "SELECT 1 FROM (SELECT pg_advisory_xact_lock(hashtext(:chave))) t", nativeQuery = true)
    Integer lockDailyQuota(@Param("chave") String chave);
}