package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.enums.NotificationType;

import java.time.Instant;

/**
 * Item da caixa do sino. A flag {@code read} é resolvida por usuário no service
 * (presença de NotificationRead). Para o toast efêmero de venda, id vem nulo e read=false.
 */
public record NotificationDTO(
    Long id,
    NotificationType type,
    String title,
    String body,
    String imageUrl,
    String clickUrl,
    Instant createdAt,
    boolean read
) {
}
