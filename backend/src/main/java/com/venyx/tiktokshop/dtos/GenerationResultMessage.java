package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.enums.ImageGenerationStatus;

/**
 * Mensagem enviada via WebSocket (STOMP) ao usuário quando uma geração assíncrona
 * termina. {@code jobId} é String para cobrir tanto jobs persistidos
 * ({@code Long.toString(id)}) quanto correlationIds (UUID) para operações que
 * não persistem (ex.: scripts virais, prompt de vídeo).
 */
public record GenerationResultMessage(
        String jobId,
        String type,
        ImageGenerationStatus status,
        Object data,
        String error
) {}
