package com.venyx.tiktokshop.entities.enums;

import com.venyx.tiktokshop.services.exceptions.BusinessException;

/** Intensidade da troca de roupa na tela /templates. Valores casam com o front. */
public enum ClothSwapMode {

    /** Substitui o look inteiro pelo produto de referência. */
    COMPLETO,
    /** Troca apenas a peça indicada, mantendo o restante do look. */
    SUBSTITUIR,
    /** Acrescenta a peça de referência ao look atual. */
    ADICIONAR,
    /** Mantém a roupa e coloca o objeto na mão ou próximo à pessoa. */
    SEGURAR_OBJETO;

    public static ClothSwapMode fromValue(String value) {
        if (value == null) {
            throw new BusinessException("Modo de troca de roupa não informado.");
        }
        try {
            return ClothSwapMode.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Modo de troca de roupa inválido: " + value);
        }
    }
}
