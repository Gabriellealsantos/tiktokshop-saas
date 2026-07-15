package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.enums.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AvatarConfigDTO(
        @NotNull(message = "Gênero é obrigatório") Gender gender,
        @NotNull(message = "Faixa etária é obrigatória") AgeRange age,
        @NotNull(message = "Tipo físico é obrigatório") BodyType bodyType,
        @NotNull(message = "Tom de pele é obrigatório") SkinTone skinTone,
        @NotNull(message = "Estilo de cabelo é obrigatório") HairStyle hairStyle,
        @NotNull(message = "Cor do cabelo é obrigatória") HairColor hairColor,
        @NotNull(message = "Enquadramento é obrigatório") ShotType shotType,
        @NotNull(message = "Estilo de roupa é obrigatório") Outfit outfit,
        @NotNull(message = "Cenário é obrigatório") Background background,

        @Size(max = 200, message = "Detalhes da roupa: máximo 200 caracteres")
        String outfitDetails,

        @Size(max = 300, message = "Detalhes extras: máximo 300 caracteres")
        String extraDetails
) {}
