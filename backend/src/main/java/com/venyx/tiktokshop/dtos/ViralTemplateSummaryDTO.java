package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.ViralFlowTemplate;

public record ViralTemplateSummaryDTO(
        String slug,
        String title,
        String subtitle,
        String description,
        String thumbnailUrl,
        String previewVideoUrl,
        String category
) {
    public ViralTemplateSummaryDTO(ViralFlowTemplate entity) {
        this(
                entity.getSlug(),
                entity.getTitle(),
                entity.getSubtitle(),
                entity.getDescription(),
                entity.getThumbnailUrl(),
                entity.getPreviewVideoUrl(),
                entity.getCategory()
        );
    }
}
