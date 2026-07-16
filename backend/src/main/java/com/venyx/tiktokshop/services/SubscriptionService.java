package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.PlanDTO;
import com.venyx.tiktokshop.dtos.SubscriptionDTO;
import com.venyx.tiktokshop.entities.Plan;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.UserSubscription;
import com.venyx.tiktokshop.entities.enums.PlanType;
import com.venyx.tiktokshop.entities.enums.SubscriptionStatus;
import com.venyx.tiktokshop.entities.enums.UserStatus;
import com.venyx.tiktokshop.repositories.PlanRepository;
import com.venyx.tiktokshop.repositories.UserRepository;
import com.venyx.tiktokshop.repositories.UserSubscriptionRepository;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

/**
 * Assinaturas: liberação manual pelo admin (pagamento é link externo — sem gateway).
 * "Liberar" = aceitar o usuário e iniciar a assinatura no plano escolhido; a contagem
 * (startedAt) começa nesse momento. Ao expirar, o usuário perde acesso (status DISABLED).
 */
@Service
public class SubscriptionService {

    private final UserSubscriptionRepository subscriptionRepository;
    private final PlanRepository planRepository;
    private final UserRepository userRepository;

    public SubscriptionService(UserSubscriptionRepository subscriptionRepository,
                               PlanRepository planRepository,
                               UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.planRepository = planRepository;
        this.userRepository = userRepository;
    }

    /** Duração em dias por tipo de plano. LIFETIME não expira (null). */
    private static Integer durationDaysOf(PlanType type) {
        return switch (type) {
            case MONTHLY -> 30;
            case QUARTERLY -> 90;
            case SEMIANNUAL -> 180;
            case ANNUAL -> 365;
            case LIFETIME -> null;
        };
    }

    /** Garante que exista um Plan para cada tipo (find-or-create), evitando depender de seed. */
    @Transactional
    public Plan resolvePlan(PlanType type) {
        return planRepository.findByType(type)
                .orElseGet(() -> planRepository.save(
                        new Plan(type, durationDaysOf(type), BigDecimal.ZERO)));
    }

    @Transactional(readOnly = true)
    public List<PlanDTO> listPlans() {
        for (PlanType type : PlanType.values()) {
            resolvePlan(type);
        }
        return planRepository.findAll().stream().map(PlanDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public SubscriptionDTO getByUser(UUID userId) {
        return subscriptionRepository.findFirstByUser_UuidOrderByStartedAtDesc(userId)
                .map(SubscriptionDTO::new)
                .orElse(null);
    }

    /**
     * Libera o acesso: (re)inicia a assinatura no plano escolhido a partir de agora e
     * marca o usuário como ACTIVE. Reaproveita a última assinatura do usuário, se houver.
     */
    @Transactional
    public void cancel(UUID userId) {
        UserSubscription subscription = subscriptionRepository
                .findFirstByUser_UuidOrderByStartedAtDesc(userId)
                .orElse(null);
        if (subscription != null && subscription.getStatus() == SubscriptionStatus.ACTIVE) {
            subscription.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(subscription);
        }
    }

    @Transactional
    public SubscriptionDTO activate(UUID userId, PlanType planType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Plan plan = resolvePlan(planType);

        Instant now = Instant.now();
        Integer days = plan.getDurationDays();
        Instant expiresAt = (days != null) ? now.plus(days, ChronoUnit.DAYS) : null;

        UserSubscription subscription = subscriptionRepository
                .findFirstByUser_UuidOrderByStartedAtDesc(userId)
                .orElseGet(UserSubscription::new);

        subscription.setUser(user);
        subscription.setPlan(plan);
        subscription.setStartedAt(now);
        subscription.setExpiresAt(expiresAt);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription = subscriptionRepository.save(subscription);

        // Aceitar o usuário = habilitar o acesso (isEnabled() = userStatus == ACTIVE).
        user.setUserStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        return new SubscriptionDTO(subscription);
    }

    /** Bloqueia o acesso: assinatura BLOCKED (se houver) e usuário LOCKED. */
    @Transactional
    public SubscriptionDTO revoke(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        user.setUserStatus(UserStatus.LOCKED);
        userRepository.save(user);

        UserSubscription subscription = subscriptionRepository
                .findFirstByUser_UuidOrderByStartedAtDesc(userId)
                .orElse(null);
        if (subscription == null) {
            return null;
        }
        subscription.setStatus(SubscriptionStatus.BLOCKED);
        subscription = subscriptionRepository.save(subscription);
        return new SubscriptionDTO(subscription);
    }

    /**
     * Expira assinaturas vencidas: marca EXPIRED e desabilita o usuário (DISABLED),
     * cortando o acesso. Chamado pelo agendador.
     */
    @Transactional
    public int expireOverdue() {
        List<UserSubscription> overdue = subscriptionRepository
                .findByStatusAndExpiresAtBefore(SubscriptionStatus.ACTIVE, Instant.now());
        for (UserSubscription sub : overdue) {
            sub.setStatus(SubscriptionStatus.EXPIRED);
            User user = sub.getUser();
            if (user != null && user.getUserStatus() == UserStatus.ACTIVE) {
                user.setUserStatus(UserStatus.DISABLED);
                userRepository.save(user);
            }
        }
        subscriptionRepository.saveAll(overdue);
        return overdue.size();
    }
}
