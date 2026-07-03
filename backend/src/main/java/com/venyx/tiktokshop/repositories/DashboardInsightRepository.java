package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.DashboardInsight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DashboardInsightRepository extends JpaRepository<DashboardInsight, Long> {

    List<DashboardInsight> findByActiveTrueOrderByOrderIndexAsc();

    List<DashboardInsight> findByKindAndActiveTrueOrderByOrderIndexAsc(String kind);
}
