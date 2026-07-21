package com.venyx.tiktokshop.dtos;

import java.util.List;

public record ViralTemplateDetailDTO(
        String slug,
        String title,
        String subtitle,
        String description,
        String thumbnailUrl,
        String previewVideoUrl,
        List<ViralCharacterDTO> characters,
        List<ViralToneDTO> tones
) {
}
