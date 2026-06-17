package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.UserProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProductRepository extends JpaRepository<UserProduct, Long> {
}
