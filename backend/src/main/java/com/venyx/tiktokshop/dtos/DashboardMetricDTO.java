package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.DashboardMetric;
import com.venyx.tiktokshop.entities.enums.DashboardPeriodType;

import java.math.BigDecimal;
import java.time.Instant;

public record DashboardMetricDTO(
    Long id,
    DashboardPeriodType periodType,
    String periodRef,
    BigDecimal revenue,
    Integer orders,
    BigDecimal commission,
    BigDecimal avgTicket,
    Instant updatedAt
) {
    public DashboardMetricDTO(DashboardMetric entity) {
        this(
            entity.getId(),
            entity.getPeriodType(),
            entity.getPeriodRef(),
            entity.getRevenue(),
            entity.getOrders(),
            entity.getCommission(),
            entity.getAvgTicket(),
            entity.getUpdatedAt()
        );
    }
}
