package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.UserLimitOverride;
import com.venyx.tiktokshop.entities.enums.FlowType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserLimitOverrideRepository extends JpaRepository<UserLimitOverride, Long> {

    List<UserLimitOverride> findByUser_Uuid(UUID userId);

    Optional<UserLimitOverride> findByUser_UuidAndFlowType(UUID userId, FlowType flowType);

    @Query("""
            SELECT COUNT(o) > 0 FROM UserLimitOverride o
            WHERE o.user.uuid = :userId AND o.flowType = :flowType AND o.unlimited = true
            """)
    boolean isUnlimitedFor(@Param("userId") UUID userId, @Param("flowType") FlowType flowType);

    /** Usuários com pelo menos uma liberação ativa — usado pra auditar exceções. */
    @Query("SELECT DISTINCT o.user.uuid FROM UserLimitOverride o WHERE o.unlimited = true")
    List<UUID> findUserIdsWithAnyUnlimited();
}
