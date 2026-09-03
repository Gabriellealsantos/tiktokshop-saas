package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.DailyLimit;
import com.venyx.tiktokshop.entities.enums.FlowType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public record DailyLimitDTO(
        FlowType flowType,

        @NotNull(message = "Limite diário é obrigatório")
        @Min(value = -1, message = "Limite diário não pode ser menor que -1")
        @Max(value = 100, message = "Limite diário não pode passar de 100")
        Integer maxPerDay,

        @NotNull(message = "Limite de correções é obrigatório")
        @Min(value = -1, message = "Limite de correções não pode ser menor que -1")
        @Max(value = 20, message = "Limite de correções não pode passar de 20")
        Integer maxRegenerations,

        Instant updatedAt,
        String updatedBy,

        /**
         * Papéis liberados desse fluxo. O GET devolve a linha de todos os papéis
         * existentes; o PUT recebe a lista de volta e substitui o conjunto.
         * Null no PUT = não mexer nos papéis (só salvar os números).
         */
        @Valid
        List<RoleLimitOverrideDTO> roleOverrides
) {
    public DailyLimitDTO(DailyLimit entity, List<RoleLimitOverrideDTO> roleOverrides) {
        this(
                entity.getFlowType(),
                entity.getMaxPerDay(),
                entity.getMaxRegenerations(),
                entity.getUpdatedAt(),
                entity.getUpdatedBy() != null ? entity.getUpdatedBy().getName() : null,
                roleOverrides
        );
    }

    public DailyLimitDTO(DailyLimit entity) {
        this(entity, List.of());
    }
}
