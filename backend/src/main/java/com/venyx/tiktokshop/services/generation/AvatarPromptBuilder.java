package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.AvatarConfigDTO;
import com.venyx.tiktokshop.entities.enums.HairStyle;
import org.springframework.stereotype.Component;


@Component
public class AvatarPromptBuilder {

    private final PromptSanitizer sanitizer;

    public AvatarPromptBuilder(PromptSanitizer sanitizer) {
        this.sanitizer = sanitizer;
    }

    public String build(AvatarConfigDTO config) {
        StringBuilder prompt = new StringBuilder()
                .append("Retrato fotográfico realista de um influenciador digital para redes sociais, ")
                .append("corpo inteiro, pessoa em pé de frente para a câmera, mãos relaxadas ao lado do corpo, ")
                .append("fundo branco sólido de estúdio. ")
                .append("Pessoa: ").append(config.gender().getDescription())
                .append(", ").append(config.age()).append(" anos")
                .append(", ").append(config.ethnicity().getDescription())
                .append(", tipo físico ").append(config.bodyType().getDescription())
                .append(", ").append(config.height()).append(" cm de altura")
                .append(". Tom de pele: ").append(config.skinTone().getDescription())
                .append(". Rosto: ").append(config.faceShape().getDescription())
                .append(", ").append(config.eyeColor().getDescription())
                .append(", ").append(config.eyebrow().getDescription())
                .append(", ").append(config.noseShape().getDescription())
                .append(", ").append(config.mouthShape().getDescription())
                .append(", ").append(config.facialHair().getDescription())
                .append(", ").append(config.expression().getDescription())
                .append(". Cabelo: ").append(config.hairStyle().getDescription());

        if (config.hairStyle() != HairStyle.BALD) {
            prompt.append(", cor ").append(config.hairColor().getDescription());
        }

        prompt.append(". Roupa: ").append(config.outfit().getDescription()).append(".");

        appendDetail(prompt, "Detalhes da roupa", config.outfitDetails());
        appendDetail(prompt, "Detalhes adicionais", config.extraDetails());

        return prompt
                .append(" Iluminação profissional de estúdio, foco nítido, alta qualidade, fundo branco puro (#FFFFFF).")
                .append(" A pessoa não deve segurar câmera nem celular.")
                .toString();
    }

    private void appendDetail(StringBuilder prompt, String label, String raw) {
        String clean = sanitizer.clean(raw);
        if (clean != null) {
            prompt.append(" ").append(label).append(": ").append(clean).append(".");
        }
    }
}
