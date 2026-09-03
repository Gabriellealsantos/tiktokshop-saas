package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.RoleLimitOverride;
import com.venyx.tiktokshop.entities.enums.FlowType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoleLimitOverrideRepository extends JpaRepository<RoleLimitOverride, Long> {

    @Query("SELECT o FROM RoleLimitOverride o JOIN FETCH o.role")
    List<RoleLimitOverride> findAllWithRole();

    List<RoleLimitOverride> findByFlowType(FlowType flowType);

    Optional<RoleLimitOverride> findByFlowTypeAndRoleId(FlowType flowType, Long roleId);

    /**
     * True se QUALQUER papel do usuário estiver liberado nesse fluxo. Uma query só,
     * sem carregar a coleção lazy de roles — roda no hot path de toda geração.
     */
    @Query("""
            SELECT COUNT(o) > 0 FROM RoleLimitOverride o
            WHERE o.flowType = :flowType
              AND o.unlimited = true
              AND o.role.id IN (SELECT r.id FROM User u JOIN u.roles r WHERE u.uuid = :userId)
            """)
    boolean isUnlimitedForAnyRoleOf(@Param("userId") UUID userId, @Param("flowType") FlowType flowType);
}
