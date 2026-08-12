package com.venyx.tiktokshop.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AvatarFromUploadDTO(
        @NotBlank(message = "URL da imagem é obrigatória")
        @Size(max = 1024) String imageUrl,

        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 60, message = "Nome deve ter no máximo 60 caracteres")
        String name,

        @Size(max = 5000, message = "O comando customizado deve ter no máximo 5000 caracteres")
        String customPrompt
) {}
