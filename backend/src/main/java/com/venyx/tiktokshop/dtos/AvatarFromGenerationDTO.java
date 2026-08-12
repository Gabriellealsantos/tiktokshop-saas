package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AvatarFromGenerationDTO(
        @NotNull(message = "Id da geração é obrigatório") Long generationId,
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 60, message = "Nome deve ter no máximo 60 caracteres")
        String name,
        
        @Size(max = 5000, message = "O comando customizado deve ter no máximo 5000 caracteres")
        String customPrompt
) {}
