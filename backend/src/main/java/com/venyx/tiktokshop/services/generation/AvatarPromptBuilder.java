package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.services.exceptions.BusinessException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Component
public class AvatarPromptBuilder {
    private static final List<String> FIELDS = List.of(
            "gender", "age", "bodyType", "skinTone", "hairStyle", "hairColor",
            "shotType", "outfit", "outfitDetails", "background", "extraDetails");

    public String build(Map<String, Object> config) {
        String traits = FIELDS.stream()
                .map(config::get)
                .filter(Objects::nonNull)
                .map(Object::toString)
                .map(String::trim)
                .filter(Predicate.not(String::isBlank))
                .collect(Collectors.joining(", "));

        if (traits.isBlank()) {
            throw new BusinessException("Configuração do avatar está vazia.");
        }

        return "Fotografia realista de um influenciador digital para redes sociais. "
                + traits
                + ". Alta qualidade, iluminação profissional, foco nítido no rosto.";
    }
}
