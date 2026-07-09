package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record AvatarGenerationRequestDTO(
        @NotEmpty(message = "Configuração do avatar é obrigatória")
        Map<String, Object> config,

        @Size(max = 1024, message = "URL de referência deve ter no máximo 1024 caracteres")
        String referenceImageUrl
) {}
