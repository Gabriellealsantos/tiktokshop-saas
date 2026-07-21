package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.ViralFlowTemplate;

/**
 * Visão administrativa completa de um template viral: inclui {@code id}, {@code active}
 * e o corpo das instruções ({@code scriptInstruction}/{@code promptInstruction}) para
 * preencher o formulário de edição. Não filtra por active (lista tudo).
 */
public record ViralTemplateAdminDTO(
        Long id,
        String slug,
        String title,
        String subtitle,
        String description,
        String thumbnailUrl,
        String previewVideoUrl,
        String scriptInstruction,
        String promptInstruction,
        boolean active
) {
    public ViralTemplateAdminDTO(ViralFlowTemplate entity) {
        this(
                entity.getId(),
                entity.getSlug(),
                entity.getTitle(),
                entity.getSubtitle(),
                entity.getDescription(),
                entity.getThumbnailUrl(),
                entity.getPreviewVideoUrl(),
                entity.getScriptInstruction(),
                entity.getPromptInstruction(),
                entity.isActive()
        );
    }
}
