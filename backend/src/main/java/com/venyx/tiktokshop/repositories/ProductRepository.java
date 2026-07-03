package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.enums.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryOrderByRankPositionAsc(ProductCategory category);
}
