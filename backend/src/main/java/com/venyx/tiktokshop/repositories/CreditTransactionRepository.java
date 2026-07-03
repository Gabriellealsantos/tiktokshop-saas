package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.CreditTransaction;
import com.venyx.tiktokshop.entities.enums.CreditTransactionReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {

    List<CreditTransaction> findByWallet_IdOrderByCreatedAtDesc(Long walletId);

    Optional<CreditTransaction> findFirstByReasonAndReferenceId(CreditTransactionReason reason, String referenceId);

    /**
     * Total de créditos consumidos em gerações no mês corrente (para o teto
     * mensal de tentativas de IA).
     */
    @Query(value = """
            SELECT COALESCE(SUM(-t.amount), 0)
              FROM credit_transactions t
              JOIN credit_wallets w ON w.id = t.wallet_id
             WHERE w.user_id = :userId
               AND t.reason = :reason
               AND t.created_at >= date_trunc('month', NOW())
            """, nativeQuery = true)
    int sumDebitsThisMonth(@Param("userId") UUID userId, @Param("reason") String reason);
}
