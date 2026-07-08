package com.venyx.tiktokshop.entities.enums;

/**
 * Natureza da notificação:
 * - SALE: prova social de venda ao vivo (efêmera, broadcast STOMP, não persiste nem entra na caixa);
 * - ANNOUNCEMENT: aviso/campanha do admin (persiste, aparece no sino);
 * - SYSTEM: mensagem do sistema (persiste, aparece no sino).
 */
public enum NotificationType {
    SALE,
    ANNOUNCEMENT,
    SYSTEM
}
