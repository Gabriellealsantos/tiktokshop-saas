package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.Size;

public record AvatarRegenerationRequestDTO(
        @Size(max = 1024, message = "URL de referência deve ter no máximo 1024 caracteres")
        String referenceImageUrl
) {}
