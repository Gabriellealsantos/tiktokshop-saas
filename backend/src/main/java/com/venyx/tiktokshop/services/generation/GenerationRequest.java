package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.enums.GenerationJobType;

import java.util.Map;
import java.util.UUID;

/**
 * Pedido de geração enviado ao provider de IA.
 */
public record GenerationRequest(
    GenerationJobType type,
    UUID userId,
    Map<String, Object> payload
) {
}
