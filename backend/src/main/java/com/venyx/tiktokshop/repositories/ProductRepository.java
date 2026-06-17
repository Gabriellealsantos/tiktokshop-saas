package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
