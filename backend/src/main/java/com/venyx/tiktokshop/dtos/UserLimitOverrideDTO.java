package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.UserLimitOverride;
import com.venyx.tiktokshop.entities.enums.FlowType;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

/** Liberação individual de um usuário em um fluxo. */
public record UserLimitOverrideDTO(
        @NotNull FlowType flowType,
        boolean unlimited,
        Instant updatedAt,
        String updatedBy
) {
    public UserLimitOverrideDTO(UserLimitOverride entity) {
        this(
                entity.getFlowType(),
                entity.isUnlimited(),
                entity.getUpdatedAt(),
                entity.getUpdatedBy() != null ? entity.getUpdatedBy().getName() : null
        );
    }
}
