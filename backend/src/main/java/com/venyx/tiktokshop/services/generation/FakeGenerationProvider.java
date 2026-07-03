package com.venyx.tiktokshop.services.generation;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Stub do provider de IA: devolve prompts e imagens simulados para manter o
 * contrato do job de geração até o dono definir o provider real.
 */
@Service
public class FakeGenerationProvider implements GenerationProvider {

    @Override
    public GenerationResult generate(GenerationRequest request) {
        Map<String, Object> data = new HashMap<>();
        data.put("provider", "fake");
        data.put("type", request.type().name());
        data.put("prompts", List.of(
                "Prompt simulado (variação 1) — substituído quando o provider real for integrado.",
                "Prompt simulado (variação 2) — substituído quando o provider real for integrado."
        ));
        data.put("imageUrls", List.of(
                "https://placehold.co/720x1280?text=variacao-1",
                "https://placehold.co/720x1280?text=variacao-2"
        ));
        return new GenerationResult(data);
    }
}
