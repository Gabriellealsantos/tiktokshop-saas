package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.LiveSalesConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LiveSalesConfigRepository extends JpaRepository<LiveSalesConfig, Long> {

    Optional<LiveSalesConfig> findTopByUserIdOrderByIdAsc(UUID userId);
}
