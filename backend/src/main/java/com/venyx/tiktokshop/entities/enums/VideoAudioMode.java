package com.venyx.tiktokshop.entities.enums;

/**
 * Camada de áudio/fala do prompt Veo3 gerado no fluxo /templates. Escolhida pelo admin
 * por template — é ortogonal ao movimento (que vem do {@code motionInstruction}). Controla
 * se o personagem fala e que tipo de som o vídeo tem.
 */
public enum VideoAudioMode {

    /** Personagem fala; narração + CTA em pt-BR (comportamento comercial padrão). */
    NARRACAO,
    /** Sem fala; trilha/áudio em alta (trending); CTA só visual. */
    MUSICA,
    /** Sem fala; áudio ambiente natural (o modelo decide); CTA só visual. */
    SILENCIO;

    /**
     * Parse tolerante vindo do form do admin. null/blank/valor inválido caem em
     * {@link #NARRACAO} — o default preserva o comportamento atual e nunca quebra a geração.
     */
    public static VideoAudioMode fromValue(String value) {
        if (value == null || value.isBlank()) {
            return NARRACAO;
        }
        try {
            return VideoAudioMode.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return NARRACAO;
        }
    }
}
