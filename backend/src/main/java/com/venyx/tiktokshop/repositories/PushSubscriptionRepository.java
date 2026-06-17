package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
}
