package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.NotificationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationScheduleRepository extends JpaRepository<NotificationSchedule, Long> {

    List<NotificationSchedule> findByActiveTrue();
}
