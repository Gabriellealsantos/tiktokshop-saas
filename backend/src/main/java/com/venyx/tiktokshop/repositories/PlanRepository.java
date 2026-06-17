package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.Plan;
import com.venyx.tiktokshop.entities.enums.PlanType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlanRepository extends JpaRepository<Plan, Long> {

    Optional<Plan> findByType(PlanType type);
}
