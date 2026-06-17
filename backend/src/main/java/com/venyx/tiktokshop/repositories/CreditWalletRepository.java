package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.CreditWallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CreditWalletRepository extends JpaRepository<CreditWallet, Long> {

    Optional<CreditWallet> findByUser_Uuid(UUID userUuid);
}
