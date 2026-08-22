package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.AvatarConfigDTO;
import com.venyx.tiktokshop.entities.enums.ClothingPart;
import com.venyx.tiktokshop.entities.enums.HairStyle;
import org.springframework.stereotype.Component;

@Component
public class AvatarPromptBuilder {

    /** Padrão fotográfico fixo — garante que todo avatar saia no mesmo enquadramento e pose. */
    static final String PADRAO_ESTUDIO = """
            Fotografia de corpo inteiro em estúdio, padrão de catálogo de moda, formato vertical 9:16.

            ENQUADRAMENTO: o corpo inteiro aparece, do topo da cabeça até abaixo dos calçados, \
            com espaço vazio acima da cabeça e abaixo dos pés. A pessoa está centralizada na \
            horizontal e ocupa cerca de 80% da altura do quadro.

            CÂMERA: na altura dos olhos, frontal, sem inclinação, sem ângulo de baixo nem de cima. \
            Aparência de lente 85mm, fotografada a uma distância que dê proporções naturais ao \
            corpo, sem distorção de grande angular.

            POSE: em pé, ereta e parada, de frente para a câmera, ombros alinhados, cabeça reta \
            e nivelada. Braços estendidos para baixo, relaxados ao lado do corpo, levemente \
            afastados do tronco, mãos abertas e visíveis. Pés apoiados no chão, paralelos, \
            afastados na largura do quadril.

            FUNDO: ciclorama de estúdio sem emenda, cinza-claro uniforme (#EFEFEF), preenchendo \
            todo o quadro como uma superfície contínua. NÃO desenhe piso, chão, parede, rodapé, \
            linha do horizonte nem qualquer emenda entre parede e chão. Sem textura, sem objetos, \
            sem móveis e sem texto. Apenas uma sombra difusa muito sutil imediatamente sob os \
            calçados, sem sombra projetada no fundo.

            ILUMINAÇÃO: luz de estúdio frontal, suave e uniforme, sem sombras duras no rosto ou \
            no corpo, balanço de branco neutro.
            """;

    static final String EVITAR = """
            Evite: cabeça ou pés cortados, câmera inclinada, vista de perfil ou três-quartos, \
            mãos na cintura ou nos bolsos, braços cruzados, poses caminhando ou dinâmicas, \
            pessoa inclinada ou sentada, segurar qualquer objeto, celular ou câmera, \
            borrão de movimento, mãos deformadas ou dedos a mais, texto ou marca d'água, \
            fundo colorido ou estampado, piso ou chão visível, linha do horizonte, \
            emenda entre parede e chão, rodapé, textura de concreto, madeira ou azulejo.
            """;

    private final PromptSanitizer sanitizer;

    public AvatarPromptBuilder(PromptSanitizer sanitizer) {
        this.sanitizer = sanitizer;
    }

    /** Roupa descrita por texto, escolhida no formulário. */
    public String build(AvatarConfigDTO config) {
        StringBuilder prompt = new StringBuilder(PADRAO_ESTUDIO);
        appendPerson(prompt, config);

        prompt.append(". Roupa: ").append(config.outfit().getDescription()).append(".");

        appendDetails(prompt, config);
        return prompt.append("\n").append(EVITAR).toString();
    }

    /** Roupa vinda de imagem de referência anexada — substitui a descrição textual. */
    public String buildWithClothingReference(AvatarConfigDTO config, ClothingPart clothingPart) {
        StringBuilder prompt = new StringBuilder(PADRAO_ESTUDIO);
        appendPerson(prompt, config);

        prompt.append(". A roupa é a peça da imagem de referência anexada: reproduza-a fielmente — ")
                .append("mesmo modelo, corte, cor, estampa e tecido, sem inventar outra roupa. ")
                .append("A pessoa veste ").append(clothingPart.getDescription()).append(" dessa imagem.");

        appendDetails(prompt, config);
        return prompt.append("\n").append(EVITAR).toString();
    }

    private void appendPerson(StringBuilder prompt, AvatarConfigDTO config) {
        prompt.append("\nPESSOA: ").append(config.gender().getDescription())
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
    }

    private void appendDetails(StringBuilder prompt, AvatarConfigDTO config) {
        appendDetail(prompt, "Detalhes da roupa", config.outfitDetails());
        appendDetail(prompt, "Detalhes adicionais", config.extraDetails());
    }

    private void appendDetail(StringBuilder prompt, String label, String raw) {
        String clean = sanitizer.clean(raw);
        if (clean != null) {
            prompt.append(" ").append(label).append(": ").append(clean).append(".");
        }
    }
}
