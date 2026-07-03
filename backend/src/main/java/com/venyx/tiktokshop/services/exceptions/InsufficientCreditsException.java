package com.venyx.tiktokshop.services.exceptions;

/**
 * Saldo de créditos insuficiente para a operação (HTTP 402).
 */
public class InsufficientCreditsException extends RuntimeException {

    public InsufficientCreditsException(String message) {
        super(message);
    }
}
