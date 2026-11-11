package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.PoseSuggestionRequestDTO;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.services.AuthService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PoseSuggestionService {

    private static final int MAX_POSES = 3;

    private final StudioProductResolver productResolver;
    private final TextProvider textProvider;
    private final AuthService authService;

    public PoseSuggestionService(StudioProductResolver productResolver,
                                 TextProvider textProvider,
                                 AuthService authService) {
        this.productResolver = productResolver;
        this.textProvider = textProvider;
        this.authService = authService;
    }


    public List<String> generate(PoseSuggestionRequestDTO req) {
        User user = authService.authenticated();
        StudioProduct product = productResolver.resolve(req, user.getUuid());

        String prompt = buildPrompt(product.name(), product.description());
        String raw = textProvider.generate(new TextProviderRequest(prompt, false)).text();

        return raw.lines()
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .map(line -> line.replaceFirst("^[\\d\\-.)\\s]+", "")) // tira "1.", "- ", etc.
                .limit(MAX_POSES)
                .toList();
    }

    private String buildPrompt(String name, String description) {
        StringBuilder sb = new StringBuilder()
                .append("Gere exatamente 3 descrições de pose para um influenciador digital ")
                .append("demonstrando um produto em um vídeo vertical de TikTok. ")
                .append("Produto: \"").append(name).append("\"");
        if (description != null && !description.isBlank()) {
            sb.append(" (").append(description.trim()).append(")");
        }
        sb.append(". Cada pose deve ser natural, específica para este produto e mostrar ")
                .append("o produto de forma clara. Escreva em português do Brasil, uma frase por pose. ")
                .append("Retorne APENAS as 3 poses, uma por linha, sem numeração, sem marcadores, ")
                .append("sem título e sem explicação.");
        return sb.toString();
    }
}
