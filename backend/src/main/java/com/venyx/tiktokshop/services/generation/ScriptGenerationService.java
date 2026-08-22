package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.ScriptGenerationRequestDTO;
import com.venyx.tiktokshop.entities.Product;
import com.venyx.tiktokshop.repositories.ProductRepository;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScriptGenerationService {

    private final ProductRepository productRepository;
    private final TextProvider textProvider;
    private final AuthService authService;

    public ScriptGenerationService(ProductRepository productRepository,
                                   TextProvider textProvider,
                                   AuthService authService) {
        this.productRepository = productRepository;
        this.textProvider = textProvider;
        this.authService = authService;
    }

    public String generate(ScriptGenerationRequestDTO req) {
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
            throw new BusinessException("Informe o produto para gerar o roteiro.");
        }

        String prompt = buildPrompt(name, description, req);
        String raw = textProvider.generate(new TextProviderRequest(prompt, false)).text();

        return raw.trim()
                .replaceAll("^\"|\"$", "")
                .replaceAll("^```[a-zA-Z]*\\s*|```$", "")
                .trim();
    }

    private String buildPrompt(String name, String description, ScriptGenerationRequestDTO req) {
        StringBuilder sb = new StringBuilder()
                .append("Escreva um roteiro de fala (voz do narrador) para um vídeo vertical estilo UGC do TikTok, ")
                .append("em que um influenciador digital apresenta e recomenda um produto. ")
                .append("Produto: \"").append(name).append("\"");
        if (description != null && !description.isBlank()) {
            sb.append(" (").append(description.trim()).append(")");
        }
        sb.append(".");

        if (hasText(req.location())) {
            sb.append(" Cenário: ").append(req.location()).append(".");
        }
        if (hasText(req.timeOfDay())) {
            sb.append(" Horário: ").append(req.timeOfDay()).append(".");
        }
        if (hasText(req.lighting())) {
            sb.append(" Iluminação: ").append(req.lighting()).append(".");
        }
        if (hasText(req.atmosphere())) {
            sb.append(" Atmosfera: ").append(req.atmosphere()).append(".");
        }
        if (hasText(req.pose())) {
            sb.append(" Pose/ação do influenciador: ").append(req.pose()).append(".");
        }

        sb.append(" O texto deve soar natural, espontâneo e persuasivo, como um vídeo de recomendação real, ")
                .append("com um gancho nos primeiros segundos, destaque de 1 a 2 benefícios do produto e uma ")
                .append("chamada para ação sutil no final. Escreva em português do Brasil, entre 50 e 500 ")
                .append("caracteres, em texto corrido (sem quebras de linha, sem marcações, sem título, sem ")
                .append("aspas). Retorne APENAS o roteiro, nada mais.");

        return sb.toString();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
