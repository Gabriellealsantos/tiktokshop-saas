package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.enums.PlanType;
import jakarta.validation.constraints.NotNull;

/**
 * Corpo do "Liberar" (ativação manual de assinatura pelo admin). O plano é
 * obrigatório: liberar = aceitar o usuário + iniciar a assinatura no plano escolhido.
 */
public record ActivateSubscriptionDTO(
        @NotNull(message = "O plano é obrigatório para liberar o acesso.")
        PlanType planType
) {}
