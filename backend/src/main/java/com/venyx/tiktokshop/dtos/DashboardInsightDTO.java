package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.DashboardInsight;

public record DashboardInsightDTO(
    Long id,
    String kind,
    String title,
    String content,
    Integer orderIndex,
    boolean active
) {
    public DashboardInsightDTO(DashboardInsight entity) {
        this(
            entity.getId(),
            entity.getKind(),
            entity.getTitle(),
            entity.getContent(),
            entity.getOrderIndex(),
            entity.isActive()
        );
    }
}
