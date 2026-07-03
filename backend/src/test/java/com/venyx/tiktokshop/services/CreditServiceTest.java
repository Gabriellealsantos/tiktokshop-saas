package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.entities.CreditTransaction;
import com.venyx.tiktokshop.entities.CreditWallet;
import com.venyx.tiktokshop.entities.enums.CreditTransactionReason;
import com.venyx.tiktokshop.repositories.CreditTransactionRepository;
import com.venyx.tiktokshop.repositories.CreditWalletRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.InsufficientCreditsException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreditServiceTest {

    @Mock
    private CreditWalletRepository walletRepository;

    @Mock
    private CreditTransactionRepository transactionRepository;

    @InjectMocks
    private CreditService service;

    private final UUID userId = UUID.randomUUID();

    @Test
    void debitDeveRegistrarTransacaoNegativaQuandoHaSaldo() {
        CreditWallet wallet = new CreditWallet();
        when(walletRepository.debitIfEnoughBalance(userId, 30)).thenReturn(1);
        when(walletRepository.findByUser_Uuid(userId)).thenReturn(Optional.of(wallet));
        when(transactionRepository.save(any(CreditTransaction.class))).thenAnswer(inv -> inv.getArgument(0));

        CreditTransaction tx = service.debit(userId, 30, CreditTransactionReason.GENERATION_DEBIT, "job:1");

        assertEquals(-30, tx.getAmount());
        assertEquals(CreditTransactionReason.GENERATION_DEBIT, tx.getReason());
        assertEquals("job:1", tx.getReferenceId());
    }

    @Test
    void debitDeveLancar402QuandoSaldoInsuficiente() {
        CreditWallet wallet = new CreditWallet();
        wallet.setBalance(10);
        when(walletRepository.debitIfEnoughBalance(userId, 50)).thenReturn(0);
        when(walletRepository.findByUser_Uuid(userId)).thenReturn(Optional.of(wallet));

        assertThrows(InsufficientCreditsException.class,
                () -> service.debit(userId, 50, CreditTransactionReason.GENERATION_DEBIT, "job:1"));
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void debitDeveRejeitarValorNaoPositivo() {
        assertThrows(BusinessException.class,
                () -> service.debit(userId, 0, CreditTransactionReason.GENERATION_DEBIT, null));
        verifyNoInteractions(walletRepository, transactionRepository);
    }

    @Test
    void creditDeveFalharQuandoCarteiraNaoExiste() {
        when(walletRepository.addBalanceByUserId(userId, 100)).thenReturn(0);

        assertThrows(ResourceNotFoundException.class,
                () -> service.credit(userId, 100, CreditTransactionReason.ADMIN_CREDIT, null));
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void refundDeveDevolverSaldoERegistrarEstorno() {
        CreditWallet wallet = mock(CreditWallet.class);
        when(wallet.getId()).thenReturn(3L);
        CreditTransaction debit = mock(CreditTransaction.class);
        when(debit.getId()).thenReturn(7L);
        when(debit.getAmount()).thenReturn(-50);
        when(debit.getWallet()).thenReturn(wallet);

        when(transactionRepository.findById(7L)).thenReturn(Optional.of(debit));
        when(transactionRepository.findFirstByReasonAndReferenceId(CreditTransactionReason.REFUND, "refund:7"))
                .thenReturn(Optional.empty());
        when(walletRepository.addBalanceByWalletId(3L, 50)).thenReturn(1);
        when(transactionRepository.save(any(CreditTransaction.class))).thenAnswer(inv -> inv.getArgument(0));

        CreditTransaction refund = service.refund(7L);

        assertEquals(50, refund.getAmount());
        assertEquals(CreditTransactionReason.REFUND, refund.getReason());
        assertEquals("refund:7", refund.getReferenceId());
    }

    @Test
    void refundDeveSerIdempotente() {
        CreditTransaction debit = mock(CreditTransaction.class);
        when(debit.getId()).thenReturn(7L);
        when(debit.getAmount()).thenReturn(-50);
        CreditTransaction estornoExistente = mock(CreditTransaction.class);

        when(transactionRepository.findById(7L)).thenReturn(Optional.of(debit));
        when(transactionRepository.findFirstByReasonAndReferenceId(CreditTransactionReason.REFUND, "refund:7"))
                .thenReturn(Optional.of(estornoExistente));

        CreditTransaction result = service.refund(7L);

        assertSame(estornoExistente, result);
        verify(walletRepository, never()).addBalanceByWalletId(anyLong(), anyInt());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void refundDeveRejeitarTransacaoDeCredito() {
        CreditTransaction credit = mock(CreditTransaction.class);
        when(credit.getAmount()).thenReturn(20);
        when(transactionRepository.findById(9L)).thenReturn(Optional.of(credit));

        assertThrows(BusinessException.class, () -> service.refund(9L));
    }
}
