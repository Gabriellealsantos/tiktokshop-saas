package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.CreditPackage;

import java.math.BigDecimal;

public record CreditPackageDTO(
    Long id,
    String name,
    Integer credits,
    Integer bonusPct,
    BigDecimal price,
    String badge,
    boolean active,
    Integer orderIndex
) {
    public CreditPackageDTO(CreditPackage entity) {
        this(
            entity.getId(),
            entity.getName(),
            entity.getCredits(),
            entity.getBonusPct(),
            entity.getPrice(),
            entity.getBadge(),
            entity.isActive(),
            entity.getOrderIndex()
        );
    }
}
