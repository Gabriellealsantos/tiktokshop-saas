package com.venyx.tiktokshop.services.payment;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Pedido de checkout (compra de plano ou pacote de créditos).
 */
public record CheckoutRequest(
    UUID userId,
    BigDecimal amount,
    String description,
    String referenceId
) {
}
