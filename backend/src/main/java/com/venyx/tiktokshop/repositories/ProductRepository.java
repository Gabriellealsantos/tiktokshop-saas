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
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByCategoryIdAndActiveTrue(Long categoryId);

    /**
     * Carrega o produto já com a {@code category} inicializada (eager via join fetch).
     * Usado na geração de prompt, que roda FORA de transação e acessa
     * {@code product.getCategory().getName()} no composer — sem o fetch, dá
     * {@code LazyInitializationException} (proxy sem sessão).
     */
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.id = :id")
    Optional<Product> findByIdWithCategory(@Param("id") Long id);

    List<Product> findByActiveTrue();

    List<Product> findByCategoryAndActiveTrueOrderByRankPositionAsc(Category category);

    long countByActiveTrueAndCreatedAtAfter(Instant since);

    @Query("SELECT COALESCE(SUM(p.estimatedRevenue), 0) FROM Product p WHERE p.active = true")
    BigDecimal sumEstimatedRevenue();

    @Query("""
            SELECT p FROM Product p
            WHERE p.active = true
              AND (:searchPattern IS NULL OR LOWER(p.name) LIKE :searchPattern)
              AND (:category IS NULL OR p.category = :category)
              AND (:miningWindow IS NULL OR p.miningWindow = :miningWindow)
            """)
    Page<Product> search(@Param("searchPattern") String searchPattern,
                          @Param("category") Category category,
                          @Param("miningWindow") MiningWindow miningWindow,
                          Pageable pageable);

    /** Sorteio de produto ativo por categoria — usado na feed de vendas ao vivo. */
    @Query(nativeQuery = true, value = """
            SELECT * FROM products
             WHERE active = true AND category_id = :categoryId
             ORDER BY random()
             LIMIT 1
            """)
    Optional<Product> pickRandomByCategory(@Param("categoryId") Long categoryId);

    /** Sorteio de qualquer produto ativo — fallback quando a fonte configurada não retorna nada. */
    @Query(nativeQuery = true, value = """
            SELECT * FROM products
             WHERE active = true
             ORDER BY random()
             LIMIT 1
            """)
    Optional<Product> pickRandomActive();


}
