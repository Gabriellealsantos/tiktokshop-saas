package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.DashboardMetric;
import com.venyx.tiktokshop.entities.enums.DashboardPeriodType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DashboardMetricRepository extends JpaRepository<DashboardMetric, Long> {

    Optional<DashboardMetric> findByPeriodTypeAndPeriodRef(DashboardPeriodType periodType, String periodRef);

    List<DashboardMetric> findByPeriodTypeOrderByPeriodRefAsc(DashboardPeriodType periodType);
}
