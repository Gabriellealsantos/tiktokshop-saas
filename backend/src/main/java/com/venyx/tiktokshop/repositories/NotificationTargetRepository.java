package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.NotificationTarget;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationTargetRepository extends JpaRepository<NotificationTarget, Long> {
}
