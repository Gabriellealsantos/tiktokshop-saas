package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.StudioImageRequestDTO;
import org.springframework.stereotype.Component;

@Component
public class SceneImagePromptBuilder {

    private final PromptSanitizer sanitizer;

    public SceneImagePromptBuilder(PromptSanitizer sanitizer) {
        this.sanitizer = sanitizer;
    }

    public String build(ProductRef product, StudioImageRequestDTO req) {
        StringBuilder prompt = new StringBuilder()
                .append("Fotografia realista para conteúdo de TikTok, no formato vertical. ")
                .append("Imagem 1 é a pessoa: preserve a identidade exatamente — mesmo rosto, ")
                .append("cabelo, tom de pele e corpo. Mantenha também a MESMA roupa da Imagem 1: ")
                .append("as mesmas peças, cores, cortes e acessórios, sem trocar, adicionar ou remover ")
                .append("nenhuma peça de vestuário. ")
                .append("Imagem 2 é o produto: reproduza o produto de forma idêntica — mesma embalagem, ")
                .append("cores, logotipo, rótulos e proporções, sem redesenhar nem inventar detalhes. ")
                .append("A pessoa da Imagem 1 aparece ").append(req.location().getDescription())
                .append(", ").append(req.timeOfDay().getDescription())
                .append(", com ").append(req.lighting().getDescription())
                .append(" e ").append(req.atmosphere().getDescription()).append(". ")
                .append("Enquadramento: ").append(req.pointOfView().getDescription()).append(". ")
                .append("Ela interage naturalmente com o produto \"").append(product.name()).append("\"");

        if (product.description() != null && !product.description().isBlank()) {
            prompt.append(" (").append(product.description().trim()).append(")");
        }

        prompt.append(", que deve aparecer claramente visível e em escala realista. ");

        String pose = sanitizer.clean(req.pose());
        if (pose != null) {
            prompt.append("Pose e ação: ").append(pose).append(". ");
        }

        return prompt
                .append("Iluminação coerente, foco nítido, aparência natural e realista, ")
                .append("sem texto na imagem, sem marca d'água, sem distorções anatômicas.")
                .toString();
    }
}
