package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.CreationSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface CreationSessionRepository extends JpaRepository<CreationSession, Long> {

    Optional<CreationSession> findByIdAndUser_Uuid(Long id, UUID userId);

    @Query(nativeQuery = true,
            value = "SELECT * FROM creation_sessions WHERE user_id = :userId ORDER BY created_at DESC",
            countQuery = "SELECT COUNT(*) FROM creation_sessions WHERE user_id = :userId")
    Page<CreationSession> findAllByUser(UUID userId, Pageable pageable);

    @Query("""
    SELECT s FROM CreationSession s
    JOIN FETCH s.user
    WHERE s.id = :id
    """)
    Optional<CreationSession> findByIdFetchingUser(Long id);

    @Modifying
    @Query(nativeQuery = true, value = """
    UPDATE creation_sessions
    SET status = 'FAILED',
        updated_at = :now
    WHERE status = 'GENERATING'
    """)
    int failStuckSessions(Instant now);
}
