package com.venyx.tiktokshop.services.payment;

/**
 * Sessão de checkout criada no gateway: o front redireciona para checkoutUrl
 * e a confirmação chega pelo webhook usando externalId.
 */
public record CheckoutSession(
    String externalId,
    String checkoutUrl
) {
}
