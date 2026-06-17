package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
