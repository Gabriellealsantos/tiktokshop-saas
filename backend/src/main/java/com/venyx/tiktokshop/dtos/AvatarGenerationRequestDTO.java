package com.venyx.tiktokshop.dtos;

import jakarta.validation.Valid;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


public record AvatarGenerationRequestDTO(
        @NotNull @Valid AvatarConfigDTO config,
        @Size(max = 1024) String referenceImageUrl
) {}
