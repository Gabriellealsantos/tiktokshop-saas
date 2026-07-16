package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.Plan;
import com.venyx.tiktokshop.entities.enums.PlanType;

import java.math.BigDecimal;

public record PlanDTO(
        Long id,
        PlanType type,
        Integer durationDays,
        BigDecimal price
) {
    public PlanDTO(Plan entity) {
        this(entity.getId(), entity.getType(), entity.getDurationDays(), entity.getPrice());
    }
}
