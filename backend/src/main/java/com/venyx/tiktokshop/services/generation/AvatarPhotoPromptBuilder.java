package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.AvatarFromPhotoRequestDTO;
import com.venyx.tiktokshop.entities.enums.ClothingMode;
import org.springframework.stereotype.Component;

@Component
public class AvatarPhotoPromptBuilder {

    private final PromptSanitizer sanitizer;

    public AvatarPhotoPromptBuilder(PromptSanitizer sanitizer) {
        this.sanitizer = sanitizer;
    }

    public String build(AvatarFromPhotoRequestDTO req) {
        StringBuilder prompt = new StringBuilder();

        if (req.clothingMode() == ClothingMode.UPLOAD) {
            prompt.append("Duas imagens de referência foram anexadas. ")
                    .append("IMAGEM 1 = PESSOA. IMAGEM 2 = ROUPA.\n")
                    .append("Gere uma nova fotografia realista de corpo inteiro combinando as duas.\n")
                    .append("Da IMAGEM 1, copie fielmente: tom de pele, textura e cor do cabelo, ")
                    .append("formato e volume do penteado, formato do rosto, cor dos olhos, ")
                    .append("faixa etária, tipo físico e altura aparente.\n")
                    .append("Da IMAGEM 2, copie fielmente a peça de roupa: modelo, corte, comprimento, ")
                    .append("decote, alças, mangas, cores exatas, estampa e tecido. ")
                    .append("A roupa da imagem final deve ser visualmente idêntica à da IMAGEM 2. ")
                    .append("É proibido substituir a peça, mudar o modelo ou inventar outra roupa.\n")
                    .append("A pessoa veste ").append(req.clothingPart().getDescription())
                    .append(" da IMAGEM 2.\n");
        } else {
            prompt.append("Uma imagem de referência foi anexada (IMAGEM 1 = PESSOA).\n")
                    .append("Gere uma nova fotografia realista de corpo inteiro.\n")
                    .append("Da IMAGEM 1, copie fielmente: tom de pele, textura e cor do cabelo, ")
                    .append("formato e volume do penteado, formato do rosto, cor dos olhos, ")
                    .append("faixa etária, tipo físico e altura aparente, e também a mesma roupa.\n");
        }

        prompt.append("Enquadramento: corpo inteiro, pessoa em pé de frente para a câmera, ")
                .append("mãos relaxadas ao lado do corpo, fundo branco sólido de estúdio.\n");

        appendDetail(prompt, "Ajustes na roupa", req.clothingInstructions());
        appendDetail(prompt, "Detalhes adicionais", req.extraOptions());

        return prompt
                .append("Iluminação profissional de estúdio, foco nítido, alta qualidade, ")
                .append("fundo branco puro (#FFFFFF). A pessoa não deve segurar câmera nem celular.")
                .toString();
    }
    private void appendDetail(StringBuilder prompt, String label, String raw) {
        String clean = sanitizer.clean(raw);
        if (clean != null) {
            prompt.append(label).append(": ").append(clean).append(". ");
        }
    }
}
