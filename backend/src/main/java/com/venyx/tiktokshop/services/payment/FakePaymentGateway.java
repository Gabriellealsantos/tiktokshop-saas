package com.venyx.tiktokshop.services.payment;

import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Stub do gateway de pagamento: gera uma sessão simulada até o dono definir
 * o gateway real (Stripe, Mercado Pago, etc.).
 */
@Service
public class FakePaymentGateway implements PaymentGateway {

    @Override
    public CheckoutSession createCheckout(CheckoutRequest request) {
        String externalId = "fake-" + UUID.randomUUID();
        return new CheckoutSession(externalId, "about:blank#checkout-simulado-" + externalId);
    }
}
