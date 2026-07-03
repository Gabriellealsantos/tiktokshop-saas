package com.venyx.tiktokshop.entities.enums;

/**
 * Tipo de geração assíncrona que consome créditos.
 * (Nome evita conflito com jakarta.persistence.GenerationType.)
 */
public enum GenerationJobType {
    STUDIO_SESSION,
    AVATAR,
    TREND_BOOST,
    IMAGE_EDIT,
    TEXT_TO_IMAGE,
    VIDEO_EXPORT
}
