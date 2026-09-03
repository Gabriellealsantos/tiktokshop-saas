package com.venyx.tiktokshop.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * Payload do modal "Limites" de um usuário: uma linha por fluxo. O PUT substitui
 * o conjunto inteiro, então a lista sempre chega completa do front.
 */
public record UserLimitOverridesDTO(
        UUID userId,
        String userName,

        @NotNull(message = "A lista de fluxos é obrigatória")
        @Valid
        List<UserLimitOverrideDTO> flows
) {
}
