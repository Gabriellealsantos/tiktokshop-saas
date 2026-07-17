package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.Category;
import com.venyx.tiktokshop.entities.enums.MiningWindow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByCategoryId(Long categoryId);

    List<Product> findByCategoryOrderByRankPositionAsc(Category category);

    long countByCreatedAtAfter(Instant since);

    @Query("SELECT COALESCE(SUM(p.estimatedRevenue), 0) FROM Product p")
    BigDecimal sumEstimatedRevenue();

    @Query("""
            SELECT p FROM Product p
            WHERE (:searchPattern IS NULL OR LOWER(p.name) LIKE :searchPattern)
              AND (:category IS NULL OR p.category = :category)
              AND (:miningWindow IS NULL OR p.miningWindow = :miningWindow)
            """)
    Page<Product> search(@Param("searchPattern") String searchPattern,
                          @Param("category") Category category,
                          @Param("miningWindow") MiningWindow miningWindow,
                          Pageable pageable);
}
