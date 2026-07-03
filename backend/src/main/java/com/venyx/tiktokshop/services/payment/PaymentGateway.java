package com.venyx.tiktokshop.services.payment;

/**
 * Contrato do gateway de pagamento. O gateway real é [A DEFINIR] pelo dono;
 * até lá, {@link FakePaymentGateway} mantém o fluxo de checkout navegável.
 */
public interface PaymentGateway {

    CheckoutSession createCheckout(CheckoutRequest request);
}
