package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.GenerationJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GenerationJobRepository extends JpaRepository<GenerationJob, Long> {

    Optional<GenerationJob> findByIdAndUser_Uuid(Long id, UUID userUuid);
}
