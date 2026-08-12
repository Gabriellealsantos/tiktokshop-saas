package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.VideoTemplate;

/**
 * Visão do usuário de um template de vídeo (card da galeria /templates).
 * {@code owned} = template privado do próprio usuário (upload manual); quando falso, é público.
 * Não expõe a direção interna do prompt (motionInstruction etc.).
 */
public record VideoTemplateSummaryDTO(
        String slug,
        String title,
        String category,
        String thumbnailUrl,
        String videoUrl,
        boolean owned,
        String imagePrompt
) {
    public VideoTemplateSummaryDTO(VideoTemplate entity) {
        this(
                entity.getSlug(),
                entity.getTitle(),
                entity.getCategory(),
                entity.getThumbnailUrl(),
                entity.getVideoUrl(),
                !entity.isPublicTemplate(),
                entity.getImagePrompt()
        );
    }
}