package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.UserSubscription;
import com.venyx.tiktokshop.entities.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {

    Optional<UserSubscription> findFirstByUser_UuidOrderByStartedAtDesc(UUID userUuid);

    /** Assinaturas ainda ACTIVE cujo prazo já passou — usadas pelo expirador agendado. */
    List<UserSubscription> findByStatusAndExpiresAtBefore(SubscriptionStatus status, Instant moment);

    @Query("SELECT us FROM UserSubscription us WHERE us.user.uuid IN :userIds AND us.status = 'ACTIVE'")
    List<UserSubscription> findActiveSubscriptionsByUserIds(@Param("userIds") List<UUID> userIds);
}
