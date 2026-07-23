package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.GalleryAvatar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GalleryAvatarRepository extends JpaRepository<GalleryAvatar, Long> {

    @Query(value = """
            SELECT * FROM gallery_avatars
            WHERE active = TRUE
              AND (:gender IS NULL OR gender = :gender)
              AND (:type IS NULL OR type = :type)
            ORDER BY order_index ASC NULLS LAST, id ASC
            """, nativeQuery = true)
    List<GalleryAvatar> findGallery(@Param("gender") String gender, @Param("type") String type);

    Optional<GalleryAvatar> findByIdAndActiveTrue(Long id);
}
