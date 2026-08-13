package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.Category;
import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.enums.MiningWindow;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ProductDTO(
    Long id,
    String name,
    String description,
    String imageUrl,
    // Escrita: só categoryId é lido. Leitura: categoryName/categorySlug são derivados.
    Long categoryId,
    String categoryName,
    String categorySlug,
    Integer sales,
    Integer views,
    String affiliateLink,
    BigDecimal price,
    BigDecimal commissionPct,
    BigDecimal estimatedRevenue,
    BigDecimal conversionRate,
    BigDecimal salesPerDay,
    BigDecimal delta7d,
    BigDecimal rating,
    Integer reviewsCount,
    List<Integer> history7d,
    MiningWindow miningWindow,
    String trendLabel,
    Integer rankPosition,
    List<String> images,
    boolean createdByAdmin,
    boolean active,
    Instant createdAt
) {
    public ProductDTO(Product entity) {
        this(
            entity.getId(),
            entity.getName(),
            entity.getDescription(),
            entity.getImageUrl(),
            entity.getCategory() != null ? entity.getCategory().getId() : null,
            entity.getCategory() != null ? entity.getCategory().getName() : null,
            entity.getCategory() != null ? entity.getCategory().getSlug() : null,
            entity.getSales(),
            entity.getViews(),
            entity.getAffiliateLink(),
            entity.getPrice(),
            entity.getCommissionPct(),
            entity.getEstimatedRevenue(),
            entity.getConversionRate(),
            entity.getSalesPerDay(),
            entity.getDelta7d(),
            entity.getRating(),
            entity.getReviewsCount(),
            entity.getHistory7d(),
            entity.getMiningWindow(),
            entity.getTrendLabel(),
            entity.getRankPosition(),
            entity.getImages(),
            entity.isCreatedByAdmin(),
            entity.isActive(),
            entity.getCreatedAt()
        );
    }
}
