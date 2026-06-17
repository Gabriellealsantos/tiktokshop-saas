package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.ReferralCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ReferralCodeRepository extends JpaRepository<ReferralCode, Long> {

    Optional<ReferralCode> findByCode(String code);

    Optional<ReferralCode> findByUser_Uuid(UUID userUuid);
}
