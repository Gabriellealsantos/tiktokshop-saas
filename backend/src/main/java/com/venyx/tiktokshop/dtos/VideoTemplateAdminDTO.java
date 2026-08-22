package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.VideoTemplate;

/**
 * Visão administrativa completa de um template de vídeo público: inclui id, active,
 * sortOrder e toda a direção do prompt (para preencher o formulário de edição).
 */
public record VideoTemplateAdminDTO(
        Long id,
        String slug,
        String title,
        String category,
        String thumbnailUrl,
        String videoUrl,
        String videoStyle,
        String objective,
        String tone,
        String energy,
        String duration,
        String motionInstruction,
        String imagePrompt,
        String scenePrompt,
        String audioMode,
        boolean active,
        int sortOrder
) {
    public VideoTemplateAdminDTO(VideoTemplate entity) {
        this(
                entity.getId(),
                entity.getSlug(),
                entity.getTitle(),
                entity.getCategory(),
                entity.getThumbnailUrl(),
                entity.getVideoUrl(),
                entity.getVideoStyle(),
                entity.getObjective(),
                entity.getTone(),
                entity.getEnergy(),
                entity.getDuration(),
                entity.getMotionInstruction(),
                entity.getImagePrompt(),
                entity.getScenePrompt(),
                entity.getAudioMode() != null ? entity.getAudioMode().name() : null,
                entity.isActive(),
                entity.getSortOrder()
        );
    }
}