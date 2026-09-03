package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.Role;
import com.venyx.tiktokshop.entities.RoleLimitOverride;
import jakarta.validation.constraints.NotNull;

/**
 * Estado de "ilimitado" de um papel dentro de um fluxo. O GET devolve a linha
 * para TODOS os papéis existentes (mesmo sem override salvo, aí unlimited=false),
 * e o PUT aceita a mesma lista de volta com os toggles alterados.
 */
public record RoleLimitOverrideDTO(
        @NotNull Long roleId,
        String authority,
        boolean unlimited
) {
    public RoleLimitOverrideDTO(Role role, boolean unlimited) {
        this(role.getId(), role.getAuthority(), unlimited);
    }

    public RoleLimitOverrideDTO(RoleLimitOverride entity) {
        this(entity.getRole().getId(), entity.getRole().getAuthority(), entity.isUnlimited());
    }
}
