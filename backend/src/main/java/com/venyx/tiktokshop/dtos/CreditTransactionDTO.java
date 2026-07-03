package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.CreditTransaction;
import com.venyx.tiktokshop.entities.enums.CreditTransactionReason;

import java.time.Instant;

public record CreditTransactionDTO(
    Long id,
    Integer amount,
    CreditTransactionReason reason,
    String referenceId,
    Instant createdAt
) {
    public CreditTransactionDTO(CreditTransaction entity) {
        this(
            entity.getId(),
            entity.getAmount(),
            entity.getReason(),
            entity.getReferenceId(),
            entity.getCreatedAt()
        );
    }
}
