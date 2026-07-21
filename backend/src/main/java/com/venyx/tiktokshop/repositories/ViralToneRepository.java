package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.ViralTone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ViralToneRepository extends JpaRepository<ViralTone, Long> {

    List<ViralTone> findAllByActiveTrueOrderBySortOrderAsc();

    /** Admin: lista todos os tons, inclusive inativos. */
    List<ViralTone> findAllByOrderBySortOrderAsc();

    Optional<ViralTone> findBySlugAndActiveTrue(String slug);

    Optional<ViralTone> findBySlug(String slug);
}
