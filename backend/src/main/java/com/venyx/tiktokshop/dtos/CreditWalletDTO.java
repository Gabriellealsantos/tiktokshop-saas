package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.CreditWallet;

import java.time.Instant;

public record CreditWalletDTO(
    Integer balance,
    Instant updatedAt
) {
    public CreditWalletDTO(CreditWallet entity) {
        this(entity.getBalance(), entity.getUpdatedAt());
    }
}
