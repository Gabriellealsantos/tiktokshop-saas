package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.AcademyLesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AcademyLessonRepository extends JpaRepository<AcademyLesson, Long> {
    List<AcademyLesson> findByModule_IdOrderByOrderIndexAsc(Long moduleId);
}
