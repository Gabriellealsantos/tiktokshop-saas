package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.entities.enums.FlowType;
import com.venyx.tiktokshop.entities.enums.ImageGenerationStatus;

import java.time.Instant;

public record ImageGenerationDTO(
        Long id,
        Long parentId,
        FlowType flowType,
        ImageGenerationStatus status,
        String prompt,
        String imageUrl,
        String error,
        Instant createdAt
) {
    public ImageGenerationDTO(ImageGeneration entity) {
        this(
                entity.getId(),
                entity.getParent() != null ? entity.getParent().getId() : null,
                entity.getFlowType(),
                entity.getStatus(),
                entity.getPrompt(),
                entity.getImageUrl(),
                entity.getError(),
                entity.getCreatedAt()
        );
    }
}
