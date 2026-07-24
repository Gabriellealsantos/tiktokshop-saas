package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.enums.ClothingMode;
import com.venyx.tiktokshop.entities.enums.ClothingPart;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AvatarFromPhotoRequestDTO(
        @NotBlank(message = "A foto é obrigatória") String photoUrl,
        @NotNull(message = "Modo da roupa é obrigatório") ClothingMode clothingMode,
        String clothingImageUrl,
        ClothingPart clothingPart,

        @Size(max = 200, message = "Instruções da roupa: máximo 200 caracteres")
        String clothingInstructions,

        @Size(max = 200, message = "Opções adicionais: máximo 200 caracteres")
        String extraOptions
) {}
