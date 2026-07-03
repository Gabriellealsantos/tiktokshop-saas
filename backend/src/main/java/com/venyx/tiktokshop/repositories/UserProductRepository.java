package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.UserProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserProductRepository extends JpaRepository<UserProduct, Long> {
    List<UserProduct> findByUser_Uuid(UUID userId);
    Optional<UserProduct> findByIdAndUser_Uuid(Long id, UUID userId);
}
