package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.NotificationRead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationReadRepository extends JpaRepository<NotificationRead, Long> {

    boolean existsByNotification_IdAndUser_Uuid(Long notificationId, UUID userId);
}
