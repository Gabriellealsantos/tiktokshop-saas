package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.GenerationJob;
import com.venyx.tiktokshop.entities.enums.GenerationJobType;
import com.venyx.tiktokshop.entities.enums.GenerationStatus;

import java.time.Instant;
import java.util.Map;

public record GenerationJobDTO(
    Long id,
    GenerationJobType type,
    GenerationStatus status,
    String referenceId,
    Map<String, Object> result,
    String error,
    Instant createdAt,
    Instant updatedAt
) {
    public GenerationJobDTO(GenerationJob entity) {
        this(
            entity.getId(),
            entity.getType(),
            entity.getStatus(),
            entity.getReferenceId(),
            entity.getResult(),
            entity.getError(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
