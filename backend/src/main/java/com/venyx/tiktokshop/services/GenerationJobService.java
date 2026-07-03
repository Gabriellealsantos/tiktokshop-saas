package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.GenerationJobDTO;
import com.venyx.tiktokshop.entities.CreditTransaction;
import com.venyx.tiktokshop.entities.GenerationJob;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.CreditTransactionReason;
import com.venyx.tiktokshop.entities.enums.GenerationJobType;
import com.venyx.tiktokshop.entities.enums.GenerationStatus;
import com.venyx.tiktokshop.repositories.GenerationJobRepository;
import com.venyx.tiktokshop.services.generation.GenerationProvider;
import com.venyx.tiktokshop.services.generation.GenerationRequest;
import com.venyx.tiktokshop.services.generation.GenerationResult;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Orquestra o ciclo de vida de um job de geração:
 * cria PENDING → debita crédito → RUNNING → provider → COMPLETED,
 * ou FAILED com estorno automático do débito.
 *
 * Todos os fluxos de IA (Estúdio, Avatares, Trend Boost, Ferramentas,
 * TokEditor) passam por aqui; o polling do front usa
 * GET /api/generations/{jobId} sobre findByIdForUser.
 */
@Service
public class GenerationJobService {

    private final GenerationJobRepository jobRepository;
    private final CreditService creditService;
    private final GenerationProvider provider;
    private final SimpMessagingTemplate messagingTemplate;

    public GenerationJobService(GenerationJobRepository jobRepository,
                                CreditService creditService,
                                GenerationProvider provider,
                                SimpMessagingTemplate messagingTemplate) {
        this.jobRepository = jobRepository;
        this.creditService = creditService;
        this.provider = provider;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Submete uma geração. O débito acontece antes de chamar o provider;
     * se o provider falhar, o débito é estornado e o job fica FAILED
     * (a falha NÃO propaga — o front lê o estado pelo polling).
     *
     * @param creditCost custo em créditos; 0 = geração sem custo
     */
    @Transactional
    public GenerationJobDTO submit(User user, GenerationJobType type, int creditCost,
                                   String referenceId, Map<String, Object> payload) {
        GenerationJob job = new GenerationJob(user, type, referenceId, payload);
        job = jobRepository.save(job);

        CreditTransaction debitTx = null;
        if (creditCost > 0) {
            debitTx = creditService.debit(user.getId(), creditCost,
                    CreditTransactionReason.GENERATION_DEBIT, "job:" + job.getId());
            job.setCreditTransaction(debitTx);
        }

        job.setStatus(GenerationStatus.RUNNING);

        try {
            GenerationResult result = provider.generate(new GenerationRequest(type, user.getId(), payload));
            job.setStatus(GenerationStatus.COMPLETED);
            job.setResult(result.data());
        } catch (Exception e) {
            job.setStatus(GenerationStatus.FAILED);
            job.setError(e.getMessage());
            if (debitTx != null) {
                creditService.refund(debitTx.getId());
            }
        }

        job = jobRepository.save(job);
        GenerationJobDTO dto = new GenerationJobDTO(job);
        messagingTemplate.convertAndSendToUser(user.getId().toString(), "/queue/generations", dto);
        return dto;
    }

    /**
     * Consulta um job validando ownership (prevenção de IDOR): job de outro
     * usuário responde 404, sem revelar a existência do recurso.
     */
    @Transactional(readOnly = true)
    public GenerationJobDTO findByIdForUser(Long jobId, UUID userId) {
        GenerationJob job = jobRepository.findByIdAndUser_Uuid(jobId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Geração não encontrada."));
        return new GenerationJobDTO(job);
    }
}
