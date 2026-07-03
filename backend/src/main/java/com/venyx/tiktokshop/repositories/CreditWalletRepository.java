package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.CreditWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CreditWalletRepository extends JpaRepository<CreditWallet, Long> {

    Optional<CreditWallet> findByUser_Uuid(UUID userUuid);

    /**
     * Débito atômico: só atualiza se houver saldo suficiente (prevenção de
     * concorrência sem lock pessimista). Retorna 0 se saldo insuficiente
     * ou carteira inexistente.
     */
    @Modifying
    @Query(value = """
            UPDATE credit_wallets
               SET balance = balance - :amount, updated_at = NOW()
             WHERE user_id = :userId AND balance >= :amount
            """, nativeQuery = true)
    int debitIfEnoughBalance(@Param("userId") UUID userId, @Param("amount") int amount);

    @Modifying
    @Query(value = """
            UPDATE credit_wallets
               SET balance = balance + :amount, updated_at = NOW()
             WHERE user_id = :userId
            """, nativeQuery = true)
    int addBalanceByUserId(@Param("userId") UUID userId, @Param("amount") int amount);

    @Modifying
    @Query(value = """
            UPDATE credit_wallets
               SET balance = balance + :amount, updated_at = NOW()
             WHERE id = :walletId
            """, nativeQuery = true)
    int addBalanceByWalletId(@Param("walletId") Long walletId, @Param("amount") int amount);
}
