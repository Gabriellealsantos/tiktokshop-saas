package com.venyx.tiktokshop.dtos;


import com.venyx.tiktokshop.entities.enums.NarratorVoice;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StudioVideoRequestDTO(
        @NotNull(message = "Sessão é obrigatória") Long sessionId,

        @NotBlank(message = "O roteiro é obrigatório")
        @Size(max = 500, message = "Roteiro: máximo 500 caracteres")
        String script,

        @NotNull(message = "Voz é obrigatória") NarratorVoice voice
) {}
