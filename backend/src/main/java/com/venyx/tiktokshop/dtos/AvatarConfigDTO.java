package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.enums.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AvatarConfigDTO(
        @NotNull(message = "Gênero é obrigatório") Gender gender,

        @NotNull(message = "Idade é obrigatória")
        @Min(value = 18, message = "Idade mínima é 18 anos")
        @Max(value = 80, message = "Idade máxima é 80 anos")
        Integer age,

        @NotNull(message = "Etnia é obrigatória") Ethnicity ethnicity,
        @NotNull(message = "Tom de pele é obrigatório") SkinTone skinTone,
        @NotNull(message = "Tipo físico é obrigatório") BodyType bodyType,

        @NotNull(message = "Altura é obrigatória")
        @Min(value = 140, message = "Altura mínima é 140 cm")
        @Max(value = 220, message = "Altura máxima é 220 cm")
        Integer height,

        @NotNull(message = "Formato do rosto é obrigatório") FaceShape faceShape,
        @NotNull(message = "Cor dos olhos é obrigatória") EyeColor eyeColor,
        @NotNull(message = "Expressão é obrigatória") Expression expression,
        @NotNull(message = "Pelos faciais são obrigatórios") FacialHair facialHair,
        @NotNull(message = "Formato da boca é obrigatório") MouthShape mouthShape,
        @NotNull(message = "Sobrancelha é obrigatória") Eyebrow eyebrow,
        @NotNull(message = "Formato do nariz é obrigatório") NoseShape noseShape,
        @NotNull(message = "Estilo de cabelo é obrigatório") HairStyle hairStyle,
        @NotNull(message = "Cor do cabelo é obrigatória") HairColor hairColor,
        @NotNull(message = "Estilo de roupa é obrigatório") Outfit outfit,

        @Size(max = 120, message = "Detalhes da roupa: máximo 120 caracteres")
        String outfitDetails,

        @Size(max = 150, message = "Detalhes extras: máximo 150 caracteres")
        String extraDetails
) {}
