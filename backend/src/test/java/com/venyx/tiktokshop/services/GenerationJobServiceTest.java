package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.GenerationJobDTO;
import com.venyx.tiktokshop.entities.CreditTransaction;
import com.venyx.tiktokshop.entities.GenerationJob;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.CreditTransactionReason;
import com.venyx.tiktokshop.entities.enums.GenerationJobType;
import com.venyx.tiktokshop.entities.enums.GenerationStatus;
import com.venyx.tiktokshop.repositories.GenerationJobRepository;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import com.venyx.tiktokshop.services.generation.GenerationProvider;
import com.venyx.tiktokshop.services.generation.GenerationRequest;
import com.venyx.tiktokshop.services.generation.GenerationResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GenerationJobServiceTest {

    @Mock
    private GenerationJobRepository jobRepository;

    @Mock
    private CreditService creditService;

    @Mock
    private GenerationProvider provider;

    @Mock
    private User user;

    @InjectMocks
    private GenerationJobService service;

    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        lenient().when(user.getId()).thenReturn(userId);
        lenient().when(jobRepository.save(any(GenerationJob.class))).thenAnswer(inv -> {
            GenerationJob job = inv.getArgument(0);
            if (job.getId() == null) {
                job.setId(1L);
            }
            return job;
        });
    }

    @Test
    void submitDeveDebitarECompletarQuandoProviderFunciona() {
        CreditTransaction debitTx = mock(CreditTransaction.class);
        when(creditService.debit(userId, 20, CreditTransactionReason.GENERATION_DEBIT, "job:1"))
                .thenReturn(debitTx);
        when(provider.generate(any(GenerationRequest.class)))
                .thenReturn(new GenerationResult(Map.of("prompts", "ok")));

        GenerationJobDTO dto = service.submit(user, GenerationJobType.AVATAR, 20, "ref-1", Map.of());

        assertEquals(GenerationStatus.COMPLETED, dto.status());
        assertEquals("ok", dto.result().get("prompts"));
        assertNull(dto.error());
        verify(creditService, never()).refund(any());
    }

    @Test
    void submitDeveEstornarQuandoProviderFalha() {
        CreditTransaction debitTx = mock(CreditTransaction.class);
        when(debitTx.getId()).thenReturn(9L);
        when(creditService.debit(eq(userId), eq(20), eq(CreditTransactionReason.GENERATION_DEBIT), any()))
                .thenReturn(debitTx);
        when(provider.generate(any(GenerationRequest.class)))
                .thenThrow(new RuntimeException("API de IA fora do ar"));

        GenerationJobDTO dto = service.submit(user, GenerationJobType.STUDIO_SESSION, 20, null, Map.of());

        assertEquals(GenerationStatus.FAILED, dto.status());
        assertEquals("API de IA fora do ar", dto.error());
        verify(creditService).refund(9L);
    }

    @Test
    void submitNaoDebitaQuandoGeracaoSemCusto() {
        when(provider.generate(any(GenerationRequest.class)))
                .thenReturn(new GenerationResult(Map.of()));

        GenerationJobDTO dto = service.submit(user, GenerationJobType.TREND_BOOST, 0, null, Map.of());

        assertEquals(GenerationStatus.COMPLETED, dto.status());
        verifyNoInteractions(creditService);
    }

    @Test
    void findByIdForUserDeveResponder404ParaJobDeOutroUsuario() {
        when(jobRepository.findByIdAndUser_Uuid(5L, userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.findByIdForUser(5L, userId));
    }
}
