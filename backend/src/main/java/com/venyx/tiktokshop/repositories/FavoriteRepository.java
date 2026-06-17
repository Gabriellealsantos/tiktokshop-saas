package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    boolean existsByUser_UuidAndProduct_Id(UUID userUuid, Long productId);

    void deleteByUser_UuidAndProduct_Id(UUID userUuid, Long productId);
}
