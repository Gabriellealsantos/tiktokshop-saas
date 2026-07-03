package com.venyx.tiktokshop.services.generation;

import java.util.Map;

/**
 * Resultado de uma geração (URLs de imagens, prompts, etc.), armazenado em
 * generation_jobs.result (JSONB).
 */
public record GenerationResult(
    Map<String, Object> data
) {
}
