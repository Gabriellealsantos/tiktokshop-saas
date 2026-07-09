package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.DailyLimit;
import com.venyx.tiktokshop.entities.enums.FlowType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface DailyLimitRepository extends JpaRepository<DailyLimit, FlowType> {
    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("SELECT d FROM DailyLimit d WHERE d.flowType = :flowType")
    Optional<DailyLimit> findByFlowTypeForUpdate(FlowType flowType);
}
