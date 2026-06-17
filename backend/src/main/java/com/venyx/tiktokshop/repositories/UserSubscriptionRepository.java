package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {

    Optional<UserSubscription> findFirstByUser_UuidOrderByStartedAtDesc(UUID userUuid);
}
