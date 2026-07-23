package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.StudioPromptConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudioPromptConfigRepository extends JpaRepository<StudioPromptConfig, Long> {
    Optional<StudioPromptConfig> findFirstByOrderByIdAsc();
}
