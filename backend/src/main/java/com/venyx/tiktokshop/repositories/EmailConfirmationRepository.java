package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.EmailConfirmation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface EmailConfirmationRepository extends JpaRepository<EmailConfirmation, UUID> {

    @Query(value = """
        SELECT * FROM tb_email_confirmation
        WHERE token = :token
          AND confirmed_at IS NULL
          AND expiration > :now
        LIMIT 1
        """, nativeQuery = true)
    Optional<EmailConfirmation> findValidByToken(@Param("token") String token,
                                                 @Param("now") Instant now);

    @Query(value = """
        SELECT COUNT(*) FROM tb_email_confirmation
        WHERE user_uuid = :userUuid
          AND created_at > :since
        """, nativeQuery = true)
    long countRecentByUser(@Param("userUuid") UUID userUuid,
                           @Param("since") Instant since);
}