package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.ViralFlowTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ViralFlowTemplateRepository extends JpaRepository<ViralFlowTemplate, Long> {

    List<ViralFlowTemplate> findAllByActiveTrueOrderByIdAsc();

    /** Admin: lista todos os templates, inclusive inativos. */
    List<ViralFlowTemplate> findAllByOrderByIdAsc();

    Optional<ViralFlowTemplate> findBySlugAndActiveTrue(String slug);

    Optional<ViralFlowTemplate> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
