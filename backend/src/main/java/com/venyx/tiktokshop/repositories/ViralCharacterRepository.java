package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.ViralCharacter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ViralCharacterRepository extends JpaRepository<ViralCharacter, Long> {

    List<ViralCharacter> findByTemplate_IdAndActiveTrueOrderBySortOrderAsc(Long templateId);

    /** Admin: lista todos os personagens de um template, inclusive inativos. */
    List<ViralCharacter> findByTemplate_IdOrderBySortOrderAsc(Long templateId);

    Optional<ViralCharacter> findByTemplate_IdAndSlugAndActiveTrue(Long templateId, String slug);
}
