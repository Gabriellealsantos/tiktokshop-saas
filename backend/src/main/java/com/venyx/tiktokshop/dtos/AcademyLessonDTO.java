package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.AcademyLesson;

import java.time.Instant;

public record AcademyLessonDTO(
    Long id,
    Long moduleId,
    String title,
    String videoUrl,
    Integer orderIndex,
    Integer duration,
    Instant createdAt
) {
    public AcademyLessonDTO(AcademyLesson entity) {
        this(
            entity.getId(),
            entity.getModule().getId(),
            entity.getTitle(),
            entity.getVideoUrl(),
            entity.getOrderIndex(),
            entity.getDuration(),
            entity.getCreatedAt()
        );
    }
}
