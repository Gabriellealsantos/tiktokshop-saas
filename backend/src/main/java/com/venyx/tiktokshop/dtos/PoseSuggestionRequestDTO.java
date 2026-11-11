package com.venyx.tiktokshop.dtos;

public record PoseSuggestionRequestDTO(
        Long productId,
        Long userProductId,
        String customProductName,
        String customProductDescription
) implements StudioProductSource {}
