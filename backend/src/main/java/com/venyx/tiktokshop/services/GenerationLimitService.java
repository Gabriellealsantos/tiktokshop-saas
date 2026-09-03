package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.DailyUsageDTO;
import com.venyx.tiktokshop.entities.DailyLimit;
import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.entities.enums.FlowType;
import com.venyx.tiktokshop.repositories.DailyLimitRepository;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import com.venyx.tiktokshop.repositories.RoleLimitOverrideRepository;
import com.venyx.tiktokshop.repositories.UserLimitOverrideRepository;
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
    private final RoleLimitOverrideRepository roleOverrideRepository;
    private final UserLimitOverrideRepository userOverrideRepository;
    private final AuthService authService;

    public GenerationLimitService(DailyLimitRepository limitRepository,
                                  ImageGenerationRepository generationRepository,
                                  RoleLimitOverrideRepository roleOverrideRepository,
                                  UserLimitOverrideRepository userOverrideRepository,
                                  AuthService authService) {
        this.limitRepository = limitRepository;
        this.generationRepository = generationRepository;
        this.roleOverrideRepository = roleOverrideRepository;
        this.userOverrideRepository = userOverrideRepository;
        this.authService = authService;
    }

    /**
     * Resolve "esse usuário tem cota infinita nesse fluxo?" do mais específico
     * para o mais amplo: exceção individual → papel (ADM/afiliado/cliente) →
     * limite global (-1 em daily_limits vale pra todo mundo).
     */
    @Transactional(readOnly = true)
    public boolean isUnlimited(UUID userId, FlowType flowType, DailyLimit globalLimit) {
        if (userOverrideRepository.isUnlimitedFor(userId, flowType)) {
            return true;
        }
        if (roleOverrideRepository.isUnlimitedForAnyRoleOf(userId, flowType)) {
            return true;
        }
        return globalLimit.getMaxPerDay() == -1;
    }

    @Transactional
    public void assertCanGenerate(UUID userId, FlowType flowType) {
        DailyLimit limit = loadLimit(flowType);

        // Checagem antes do lock: quem é ilimitado nem entra na fila da cota.
        if (isUnlimited(userId, flowType, limit)) {
            return;
        }

        generationRepository.lockDailyQuota(userId + ":" + flowType.name());

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

        // Quem está liberado no fluxo também não gasta correção.
        if (isUnlimited(parent.getUser().getId(), parent.getFlowType(), limit)
                || limit.getMaxRegenerations() == -1) {
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
        return limitRepository.findById(flowType)
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

        // -1 no contrato do front significa ∞ — vale tanto pro limite global
        // quanto pra quem foi liberado por papel ou individualmente.
        if (isUnlimited(userId, flowType, limit)) {
            return new DailyUsageDTO(used, -1, -1);
        }

        int max = limit.getMaxPerDay();
        return new DailyUsageDTO(used, max, Math.max(0, max - used));
    }
}
