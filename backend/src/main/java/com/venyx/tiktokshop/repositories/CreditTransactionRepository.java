package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.CreditTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {

    List<CreditTransaction> findByWallet_IdOrderByCreatedAtDesc(Long walletId);
}
