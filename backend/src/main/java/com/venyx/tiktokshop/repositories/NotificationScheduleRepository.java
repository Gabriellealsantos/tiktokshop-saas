package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.NotificationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NotificationScheduleRepository extends JpaRepository<NotificationSchedule, Long> {

    List<NotificationSchedule> findByActiveTrue();


    /** Campanhas ativas com o criador já carregado — evita N+1 no tick de 5s. */
    @Query("""
        SELECT s FROM NotificationSchedule s
        LEFT JOIN FETCH s.createdBy
        WHERE s.active = true
        """)
    List<NotificationSchedule> findActiveFetchingCreator();
}
