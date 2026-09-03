package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.DailyLimitDTO;
import com.venyx.tiktokshop.dtos.RoleLimitOverrideDTO;
import com.venyx.tiktokshop.dtos.UserLimitOverrideDTO;
import com.venyx.tiktokshop.dtos.UserLimitOverridesDTO;
import com.venyx.tiktokshop.entities.DailyLimit;
import com.venyx.tiktokshop.entities.Role;
import com.venyx.tiktokshop.entities.RoleLimitOverride;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.UserLimitOverride;
import com.venyx.tiktokshop.entities.enums.FlowType;
import com.venyx.tiktokshop.repositories.DailyLimitRepository;
import com.venyx.tiktokshop.repositories.RoleLimitOverrideRepository;
import com.venyx.tiktokshop.repositories.RoleRepository;
import com.venyx.tiktokshop.repositories.UserLimitOverrideRepository;
import com.venyx.tiktokshop.repositories.UserRepository;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DailyLimitService {

    private final DailyLimitRepository repository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final RoleLimitOverrideRepository roleOverrideRepository;
    private final UserLimitOverrideRepository userOverrideRepository;
    private final AuthService authService;

    public DailyLimitService(DailyLimitRepository repository,
                             RoleRepository roleRepository,
                             UserRepository userRepository,
                             RoleLimitOverrideRepository roleOverrideRepository,
                             UserLimitOverrideRepository userOverrideRepository,
                             AuthService authService) {
        this.repository = repository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.roleOverrideRepository = roleOverrideRepository;
        this.userOverrideRepository = userOverrideRepository;
        this.authService = authService;
    }

    // ── Limites globais + liberação por papel ────────────────────────────────

    @Transactional(readOnly = true)
    public List<DailyLimitDTO> findAll() {
        List<Role> roles = roleRepository.findAll();
        // Uma leitura só dos overrides, indexada por (fluxo, papel), pra não
        // disparar N queries montando os cards.
        Map<FlowType, Map<Long, Boolean>> byFlow = roleOverrideRepository.findAllWithRole().stream()
                .collect(Collectors.groupingBy(
                        RoleLimitOverride::getFlowType,
                        Collectors.toMap(o -> o.getRole().getId(), RoleLimitOverride::isUnlimited)));

        return repository.findAll().stream()
                .map(limit -> new DailyLimitDTO(limit, roleRows(roles, byFlow.get(limit.getFlowType()))))
                .toList();
    }

    @Transactional(readOnly = true)
    public DailyLimitDTO findByFlowType(FlowType flowType) {
        DailyLimit entity = loadOrThrow(flowType);
        Map<Long, Boolean> saved = roleOverrideRepository.findByFlowType(flowType).stream()
                .collect(Collectors.toMap(o -> o.getRole().getId(), RoleLimitOverride::isUnlimited));
        return new DailyLimitDTO(entity, roleRows(roleRepository.findAll(), saved));
    }

    @Transactional
    public DailyLimitDTO update(FlowType flowType, DailyLimitDTO dto) {
        User admin = authService.authenticated();

        DailyLimit entity = loadOrThrow(flowType);
        entity.setMaxPerDay(dto.maxPerDay());
        entity.setMaxRegenerations(dto.maxRegenerations());
        entity.setUpdatedAt(Instant.now());
        entity.setUpdatedBy(admin);
        DailyLimit saved = repository.save(entity);

        if (dto.roleOverrides() != null) {
            applyRoleOverrides(flowType, dto.roleOverrides(), admin);
        }
        return findByFlowType(saved.getFlowType());
    }

    private void applyRoleOverrides(FlowType flowType, List<RoleLimitOverrideDTO> rows, User admin) {
        Map<Long, RoleLimitOverride> existing = roleOverrideRepository.findByFlowType(flowType).stream()
                .collect(Collectors.toMap(o -> o.getRole().getId(), Function.identity()));

        for (RoleLimitOverrideDTO row : rows) {
            RoleLimitOverride current = existing.get(row.roleId());

            if (current == null) {
                // Sem override salvo e continua sem liberação: nada a persistir.
                if (!row.unlimited()) {
                    continue;
                }
                Role role = roleRepository.findById(row.roleId())
                        .orElseThrow(() -> new ResourceNotFoundException("Papel não encontrado: " + row.roleId()));
                current = new RoleLimitOverride(flowType, role, true);
            } else if (current.isUnlimited() == row.unlimited()) {
                continue;
            } else {
                current.setUnlimited(row.unlimited());
            }

            current.setUpdatedAt(Instant.now());
            current.setUpdatedBy(admin);
            roleOverrideRepository.save(current);
        }
    }

    /** Uma linha por papel existente — inclusive os que não têm override salvo. */
    private List<RoleLimitOverrideDTO> roleRows(List<Role> roles, Map<Long, Boolean> saved) {
        Map<Long, Boolean> flags = saved != null ? saved : Map.of();
        return roles.stream()
                .map(role -> new RoleLimitOverrideDTO(role, Boolean.TRUE.equals(flags.get(role.getId()))))
                .toList();
    }

    // ── Liberação individual (exceção por usuário) ───────────────────────────

    @Transactional(readOnly = true)
    public UserLimitOverridesDTO findUserOverrides(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + userId));

        Map<FlowType, UserLimitOverride> saved = userOverrideRepository.findByUser_Uuid(userId).stream()
                .collect(Collectors.toMap(UserLimitOverride::getFlowType, Function.identity()));

        // Uma linha por fluxo configurado, pra o modal renderizar tudo de uma vez.
        List<UserLimitOverrideDTO> flows = repository.findAll().stream()
                .map(DailyLimit::getFlowType)
                .sorted(Comparator.comparing(Enum::name))
                .map(flow -> {
                    UserLimitOverride o = saved.get(flow);
                    return o != null
                            ? new UserLimitOverrideDTO(o)
                            : new UserLimitOverrideDTO(flow, false, null, null);
                })
                .toList();

        return new UserLimitOverridesDTO(user.getUuid(), user.getName(), flows);
    }

    @Transactional
    public UserLimitOverridesDTO updateUserOverrides(UUID userId, UserLimitOverridesDTO dto) {
        User admin = authService.authenticated();
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + userId));

        Map<FlowType, UserLimitOverride> existing = userOverrideRepository.findByUser_Uuid(userId).stream()
                .collect(Collectors.toMap(UserLimitOverride::getFlowType, Function.identity()));

        for (UserLimitOverrideDTO row : dto.flows()) {
            UserLimitOverride current = existing.get(row.flowType());

            if (current == null) {
                if (!row.unlimited()) {
                    continue;
                }
                current = new UserLimitOverride(row.flowType(), target, true);
            } else if (current.isUnlimited() == row.unlimited()) {
                continue;
            } else {
                current.setUnlimited(row.unlimited());
            }

            current.setUpdatedAt(Instant.now());
            current.setUpdatedBy(admin);
            userOverrideRepository.save(current);
        }
        return findUserOverrides(userId);
    }

    private DailyLimit loadOrThrow(FlowType flowType) {
        return repository.findById(flowType)
                .orElseThrow(() -> new ResourceNotFoundException("Limite não configurado: " + flowType));
    }
}
