package com.venyx.tiktokshop.dtos;

public record ScriptGenerationRequestDTO(
        Long productId,
        String customProductName,
        String customProductDescription,
        String location,
        String timeOfDay,
        String lighting,
        String atmosphere,
        String pose
) {}
