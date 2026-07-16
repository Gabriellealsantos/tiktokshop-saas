package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.NotificationSoundSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationSoundSettingsRepository extends JpaRepository<NotificationSoundSettings, Long> {

    Optional<NotificationSoundSettings> findTopByOrderByIdAsc();
}
