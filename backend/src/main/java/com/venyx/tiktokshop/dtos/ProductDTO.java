package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.entities.enums.MiningWindow;
import com.venyx.tiktokshop.entities.enums.ProductCategory;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ProductDTO(
    Long id,
    String name,
    String description,
    String imageUrl,
    ProductCategory category,
    Integer sales,
    Integer views,
    String affiliateLink,
    BigDecimal price,
    BigDecimal commissionPct,
    BigDecimal estimatedRevenue,
    BigDecimal conversionRate,
    BigDecimal salesPerDay,
    BigDecimal delta7d,
    List<Integer> history7d,
    MiningWindow miningWindow,
    String trendLabel,
    Integer rankPosition,
    List<String> images,
    boolean createdByAdmin,
    Instant createdAt
) {
    public ProductDTO(Product entity) {
        this(
            entity.getId(),
            entity.getName(),
            entity.getDescription(),
            entity.getImageUrl(),
            entity.getCategory(),
            entity.getSales(),
            entity.getViews(),
            entity.getAffiliateLink(),
            entity.getPrice(),
            entity.getCommissionPct(),
            entity.getEstimatedRevenue(),
            entity.getConversionRate(),
            entity.getSalesPerDay(),
            entity.getDelta7d(),
            entity.getHistory7d(),
            entity.getMiningWindow(),
            entity.getTrendLabel(),
            entity.getRankPosition(),
            entity.getImages(),
            entity.isCreatedByAdmin(),
            entity.getCreatedAt()
        );
    }
}
