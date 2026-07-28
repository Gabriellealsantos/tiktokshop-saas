package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.AuthSecuritySettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthSecuritySettingsRepository extends JpaRepository<AuthSecuritySettings, Long> {

    Optional<AuthSecuritySettings> findTopByOrderByIdAsc();
}