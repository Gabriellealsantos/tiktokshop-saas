package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.DashboardMetric;
import com.venyx.tiktokshop.entities.enums.DashboardPeriodType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DashboardMetricRepository extends JpaRepository<DashboardMetric, Long> {

    Optional<DashboardMetric> findByUserIdAndPeriodTypeAndPeriodRef(UUID userId, DashboardPeriodType periodType, String periodRef);

    List<DashboardMetric> findByUserIdAndPeriodTypeOrderByPeriodRefAsc(UUID userId, DashboardPeriodType periodType);

    List<DashboardMetric> findByUserId(UUID userId);

    @Modifying
    @Query(value = "DELETE FROM dashboard_metrics WHERE user_id = :userId AND period_ref IN (:refs)", nativeQuery = true)
    int deleteByUserIdAndPeriodRefIn(@Param("userId") UUID userId, @Param("refs") List<String> refs);
}
