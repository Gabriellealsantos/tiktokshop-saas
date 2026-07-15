package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.Avatar;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AvatarRepository extends JpaRepository<Avatar, Long> {

    @Query(nativeQuery = true, value = """
        SELECT * FROM avatars WHERE user_id = :userId ORDER BY created_at DESC
        """)
    List<Avatar> findAllByUser(UUID userId);

    Optional<Avatar> findByIdAndUser_Uuid(Long id, UUID userId);

    boolean existsByGeneration_Id(Long generationId);

    @Query(nativeQuery = true,
            value = "SELECT * FROM avatars WHERE user_id = :userId",
            countQuery = "SELECT COUNT(*) FROM avatars WHERE user_id = :userId")
    Page<Avatar> findAllByUser(UUID userId, Pageable pageable);
}
