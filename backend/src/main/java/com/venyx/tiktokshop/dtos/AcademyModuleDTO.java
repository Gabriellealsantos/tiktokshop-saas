package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.AcademyModule;

import java.time.Instant;
import java.util.List;

public record AcademyModuleDTO(
    Long id,
    String title,
    String description,
    Integer orderIndex,
    Instant createdAt,
    List<AcademyLessonDTO> lessons
) {
    public AcademyModuleDTO(AcademyModule entity) {
        this(entity, null);
    }

    public AcademyModuleDTO(AcademyModule entity, List<AcademyLessonDTO> lessons) {
        this(
            entity.getId(),
            entity.getTitle(),
            entity.getDescription(),
            entity.getOrderIndex(),
            entity.getCreatedAt(),
            lessons
        );
    }
}
