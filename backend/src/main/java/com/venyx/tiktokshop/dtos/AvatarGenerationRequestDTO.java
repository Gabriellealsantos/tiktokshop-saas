package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.enums.ClothingPart;
import jakarta.validation.Valid;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


public record AvatarGenerationRequestDTO(
        @NotNull @Valid AvatarConfigDTO config,
        @Size(max = 1024) String referenceImageUrl,

        @Size(max = 1024) String clothingImageUrl,
        ClothingPart clothingPart
) {}
