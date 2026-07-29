package com.venyx.tiktokshop.dtos;

public record PoseSuggestionRequestDTO(
        Long productId,
        String customProductName,
        String customProductDescription
) {}