package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.DailyUsageDTO;
import com.venyx.tiktokshop.entities.DailyLimit;
import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.entities.enums.FlowType;
import com.venyx.tiktokshop.repositories.DailyLimitRepository;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.DailyLimitExceededException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

@Service
public class GenerationLimitService {

    private static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");

    private final DailyLimitRepository limitRepository;
    private final ImageGenerationRepository generationRepository;
    private final AuthService authService;

    public GenerationLimitService(DailyLimitRepository limitRepository,
                                  ImageGenerationRepository generationRepository,
                                  AuthService authService) {
        this.limitRepository = limitRepository;
        this.generationRepository = generationRepository;
        this.authService = authService;
    }

    @Transactional
    public void assertCanGenerate(UUID userId, FlowType flowType) {
        DailyLimit limit = loadLimit(flowType);
        
        if (limit.getMaxPerDay() == -1) {
            return;
        }
        
        long used = generationRepository.countFinalsToday(
                userId, flowType.name(), dayStart(), dayEnd());

        if (used >= limit.getMaxPerDay()) {
            throw new DailyLimitExceededException(
                    "Limite diário esgotado (%d/%d). Tente novamente amanhã."
                            .formatted(used, limit.getMaxPerDay()));
        }
    }

    @Transactional
    public void assertCanRegenerate(ImageGeneration parent) {
        DailyLimit limit = loadLimit(parent.getFlowType());
        
        if (limit.getMaxRegenerations() == -1) {
            return;
        }
        
        long used = generationRepository.countRegenerations(parent.getId());

        if (used >= limit.getMaxRegenerations()) {
            throw new DailyLimitExceededException(
                    "Limite de correções desta geração esgotado (%d/%d)."
                            .formatted(used, limit.getMaxRegenerations()));
        }
    }

    private DailyLimit loadLimit(FlowType flowType) {
        return limitRepository.findByFlowTypeForUpdate(flowType)
                .orElseThrow(() -> new BusinessException(
                        "Limite não configurado para o fluxo: " + flowType));
    }

    private Instant dayStart() {
        return LocalDate.now(ZONE).atStartOfDay(ZONE).toInstant();
    }

    private Instant dayEnd() {
        return LocalDate.now(ZONE).plusDays(1).atStartOfDay(ZONE).toInstant();
    }

    @Transactional(readOnly = true)
    public DailyUsageDTO usageToday(FlowType flowType) {
        UUID userId = authService.authenticated().getUuid();

        DailyLimit limit = limitRepository.findById(flowType)
                .orElseThrow(() -> new BusinessException("Limite não configurado para o fluxo: " + flowType));

        int used = (int) generationRepository.countFinalsToday(userId, flowType.name(), dayStart(), dayEnd());
        int max = limit.getMaxPerDay();

        if (max == -1) {
            return new DailyUsageDTO(used, -1, -1);
        }

        return new DailyUsageDTO(used, max, Math.max(0, max - used));
    }
}
