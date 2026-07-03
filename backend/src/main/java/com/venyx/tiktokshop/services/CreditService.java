package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.CreditTransactionDTO;
import com.venyx.tiktokshop.dtos.CreditWalletDTO;
import com.venyx.tiktokshop.entities.CreditTransaction;
import com.venyx.tiktokshop.entities.CreditWallet;
import com.venyx.tiktokshop.entities.enums.CreditTransactionReason;
import com.venyx.tiktokshop.repositories.CreditTransactionRepository;
import com.venyx.tiktokshop.repositories.CreditWalletRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.InsufficientCreditsException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Serviço transversal de créditos. Toda função de IA debita ANTES de gerar
 * e estorna em caso de falha (idempotente por transação de débito).
 */
@Service
public class CreditService {

    private final CreditWalletRepository walletRepository;
    private final CreditTransactionRepository transactionRepository;

    public CreditService(CreditWalletRepository walletRepository,
                         CreditTransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }

    /**
     * Debita créditos de forma atômica ({@code UPDATE ... WHERE balance >= ?}),
     * segura contra débito concorrente na mesma carteira.
     *
     * @return a transação de débito registrada (amount negativo)
     * @throws InsufficientCreditsException se o saldo for insuficiente (402)
     */
    @Transactional
    public CreditTransaction debit(UUID userId, int amount, CreditTransactionReason reason, String referenceId) {
        if (amount <= 0) {
            throw new BusinessException("O valor do débito deve ser positivo.");
        }

        int updated = walletRepository.debitIfEnoughBalance(userId, amount);
        if (updated == 0) {
            CreditWallet wallet = findWalletOrThrow(userId);
            throw new InsufficientCreditsException(
                    "Créditos insuficientes: necessário " + amount + ", saldo atual " + wallet.getBalance() + ".");
        }

        CreditWallet wallet = findWalletOrThrow(userId);
        CreditTransaction tx = new CreditTransaction(wallet, -amount, reason, referenceId);
        return transactionRepository.save(tx);
    }

    /**
     * Credita a carteira do usuário (bônus, compra de pacote, ajuste do admin).
     */
    @Transactional
    public CreditTransaction credit(UUID userId, int amount, CreditTransactionReason reason, String referenceId) {
        if (amount <= 0) {
            throw new BusinessException("O valor do crédito deve ser positivo.");
        }

        int updated = walletRepository.addBalanceByUserId(userId, amount);
        if (updated == 0) {
            throw new ResourceNotFoundException("Carteira de créditos não encontrada para o usuário.");
        }

        CreditWallet wallet = findWalletOrThrow(userId);
        CreditTransaction tx = new CreditTransaction(wallet, amount, reason, referenceId);
        return transactionRepository.save(tx);
    }

    /**
     * Estorna uma transação de débito (falha na geração externa).
     * Idempotente: estornar duas vezes a mesma transação devolve o estorno já feito.
     */
    @Transactional
    public CreditTransaction refund(Long debitTransactionId) {
        CreditTransaction debit = transactionRepository.findById(debitTransactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transação de crédito não encontrada."));

        if (debit.getAmount() >= 0) {
            throw new BusinessException("Só é possível estornar uma transação de débito.");
        }

        String refundReference = "refund:" + debit.getId();
        Optional<CreditTransaction> existing =
                transactionRepository.findFirstByReasonAndReferenceId(CreditTransactionReason.REFUND, refundReference);
        if (existing.isPresent()) {
            return existing.get();
        }

        int amount = -debit.getAmount();
        int updated = walletRepository.addBalanceByWalletId(debit.getWallet().getId(), amount);
        if (updated == 0) {
            throw new ResourceNotFoundException("Carteira de créditos não encontrada para o estorno.");
        }

        CreditTransaction refundTx =
                new CreditTransaction(debit.getWallet(), amount, CreditTransactionReason.REFUND, refundReference);
        return transactionRepository.save(refundTx);
    }

    @Transactional(readOnly = true)
    public CreditWalletDTO getWallet(UUID userId) {
        return new CreditWalletDTO(findWalletOrThrow(userId));
    }

    @Transactional(readOnly = true)
    public List<CreditTransactionDTO> getStatement(UUID userId) {
        CreditWallet wallet = findWalletOrThrow(userId);
        return transactionRepository.findByWallet_IdOrderByCreatedAtDesc(wallet.getId())
                .stream()
                .map(CreditTransactionDTO::new)
                .toList();
    }

    /**
     * Créditos consumidos em gerações no mês corrente (teto mensal de tentativas).
     */
    @Transactional(readOnly = true)
    public int monthlyGenerationUsage(UUID userId) {
        return transactionRepository.sumDebitsThisMonth(userId, CreditTransactionReason.GENERATION_DEBIT.name());
    }

    private CreditWallet findWalletOrThrow(UUID userId) {
        return walletRepository.findByUser_Uuid(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira de créditos não encontrada para o usuário."));
    }
}
