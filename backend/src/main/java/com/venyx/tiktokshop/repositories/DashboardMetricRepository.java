package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.DashboardMetric;
import com.venyx.tiktokshop.entities.enums.DashboardPeriodType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DashboardMetricRepository extends JpaRepository<DashboardMetric, Long> {

    Optional<DashboardMetric> findByPeriodTypeAndPeriodRef(DashboardPeriodType periodType, String periodRef);

    List<DashboardMetric> findByPeriodTypeOrderByPeriodRefAsc(DashboardPeriodType periodType);

    @Modifying
    @Query(value = "DELETE FROM dashboard_metrics WHERE period_ref IN (:refs)", nativeQuery = true)
    int deleteByPeriodRefIn(@Param("refs") List<String> refs);
}
