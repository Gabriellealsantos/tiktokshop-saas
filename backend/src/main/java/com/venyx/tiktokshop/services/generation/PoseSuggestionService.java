package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.PoseSuggestionRequestDTO;
import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.repositories.ProductRepository;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PoseSuggestionService {

    private final ProductRepository productRepository;
    private final TextProvider textProvider;
    private final AuthService authService;

    public PoseSuggestionService(ProductRepository productRepository,
                                 TextProvider textProvider,
                                 AuthService authService) {
        this.productRepository = productRepository;
        this.textProvider = textProvider;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<String> generate(PoseSuggestionRequestDTO req) {
        authService.authenticated();

        String name;
        String description;

        if (req.productId() != null) {
            Product product = productRepository.findById(req.productId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Produto não encontrado: " + req.productId()));
            name = product.getName();
            description = product.getDescription();
        } else if (req.customProductName() != null && !req.customProductName().isBlank()) {
            name = req.customProductName().trim();
            description = req.customProductDescription();
        } else {
            throw new BusinessException("Informe o produto para gerar as sugestões.");
        }

        String prompt = buildPrompt(name, description);
        String raw = textProvider.generate(new TextProviderRequest(prompt, false)).text();

        return raw.lines()
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .map(line -> line.replaceFirst("^[\\d\\-.)\\s]+", "")) // tira "1.", "- ", etc.
                .limit(3)
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
