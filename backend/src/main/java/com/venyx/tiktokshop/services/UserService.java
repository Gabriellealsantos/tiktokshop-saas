package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.ChangePasswordDTO;
import com.venyx.tiktokshop.dtos.ProfileUpdateDTO;
import com.venyx.tiktokshop.dtos.RoleDTO;
import com.venyx.tiktokshop.dtos.UserDTO;
import com.venyx.tiktokshop.dtos.UserInsertDTO;
import com.venyx.tiktokshop.dtos.UserUpdateDTO;
import com.venyx.tiktokshop.entities.Role;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.UserStatus;
import com.venyx.tiktokshop.interfaces.UserData;
import com.venyx.tiktokshop.repositories.RoleRepository;
import com.venyx.tiktokshop.repositories.UserRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.DatabaseException;
import com.venyx.tiktokshop.services.exceptions.ForbiddenException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class UserService {

    // Roles que exigem telefone. AFFILIATE fica de fora.
    private static final Set<String> PHONE_REQUIRED_ROLES =
            Set.of(RoleConstants.ROLE_CLIENT, RoleConstants.ROLE_ADMIN, RoleConstants.ROLE_AFFILIATE);

    private final PasswordEncoder passwordEncoder;
    private final UserRepository repository;
    private final RoleRepository roleRepository;
    private final AuthService authService;

    public UserService(PasswordEncoder passwordEncoder,
                       UserRepository repository,
                       RoleRepository roleRepository,
                       AuthService authService) {
        this.passwordEncoder = passwordEncoder;
        this.repository = repository;
        this.roleRepository = roleRepository;
        this.authService = authService;
    }

    private void enforcePhoneForClientOrAdmin(User entity) {
        boolean requiresPhone = entity.getRoles().stream()
                .anyMatch(r -> PHONE_REQUIRED_ROLES.contains(r.getAuthority()));
        if (requiresPhone && (entity.getPhone() == null || entity.getPhone().isBlank())) {
            throw new BusinessException("Telefone é obrigatório para clientes e administradores.");
        }
    }

    @Transactional(readOnly = true)
    public UserDTO findMe() {
        User entity = authService.authenticated();
        return new UserDTO(entity);
    }

    @Transactional(readOnly = true)
    public UserDTO findById(UUID id) {
        User entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return new UserDTO(entity);
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> findAllPaged(String search, Pageable pageable) {
        String searchParam = (search == null || search.isBlank()) ? null : search;
        Page<User> page = repository.searchUsers(searchParam, pageable);
        return page.map(UserDTO::new);
    }

    @Transactional
    public UserDTO insert(UserInsertDTO dto) {

        validateRoleAssignment(dto.roles());

        User entity = new User();
        copyDtoToEntity(dto, entity);

        entity.setPassword(passwordEncoder.encode(dto.password()));

        entity.setUserStatus(resolveUserStatusForInsert(dto.userStatus()));

        entity.getRoles().clear();

        if (dto.roles() != null && !dto.roles().isEmpty()) {
            for (RoleDTO roleDto : dto.roles()) {
                Role role = roleRepository.findById(roleDto.id())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Role não encontrada: " + roleDto.id()));
                entity.getRoles().add(role);
            }
        } else {
            Role role = roleRepository.findByAuthority(RoleConstants.ROLE_CLIENT)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Role ROLE_CLIENT não encontrada."));
            entity.getRoles().add(role);
        }

        enforcePhoneForClientOrAdmin(entity);
        entity = repository.save(entity);
        return new UserDTO(entity);
    }

    private UserStatus resolveUserStatusForInsert(UserStatus requested) {
        User current = safeCurrentUser();

        boolean isPrivileged = current != null && current.hasRole(RoleConstants.ROLE_ADMIN);

        if (!isPrivileged) {
            return UserStatus.PENDING_CONFIRMATION;
        }

        return requested != null ? requested : UserStatus.ACTIVE;
    }

    @Transactional
    public User findOrCreateUserFromOauth(String email, String name, String imageUrl) {
        if (email == null || email.isBlank()) {
            throw new BusinessException("E-mail é obrigatório para login via OAuth.");
        }

        Optional<User> userOptional = repository.findByEmail(email);
        if (userOptional.isPresent()) {
            User existingUser = userOptional.get();

            // Google já verificou o email — ativa conta pendente automaticamente
            if (existingUser.getUserStatus() == UserStatus.PENDING_CONFIRMATION) {
                existingUser.setUserStatus(UserStatus.ACTIVE);
                repository.save(existingUser);
            }

            return existingUser;
        }

        User newUser = new User();
        newUser.setEmail(email.trim().toLowerCase());

        String safeName = (name == null || name.isBlank()) ? "Usuário" : name.trim();
        if (safeName.length() > 120) {
            safeName = safeName.substring(0, 120);
        }
        newUser.setName(safeName);

        newUser.setUserStatus(UserStatus.ACTIVE);
        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

        Role role = roleRepository.findByAuthority(RoleConstants.ROLE_CLIENT).orElse(null);
        if (role != null) {
            newUser.getRoles().add(role);
        }

        return repository.save(newUser);
    }

    @Transactional
    public UserDTO update(UUID id, UserUpdateDTO dto) {
        validateRoleAssignment(dto.roles());
        try {
            User entity = repository.getReferenceById(id);

            // colunas UNIQUE: valida antes p/ mensagem de campo (evita 409/500 genérico do banco)
            ensureEmailAvailable(dto.email(), id);
            ensureCpfAvailable(dto.cpf(), id);
            ensurePhoneAvailable(dto.phoneNumber(), id);

            copyDtoToEntity(dto, entity);

            if (dto.password() != null && !dto.password().isBlank()) {
                entity.setPassword(passwordEncoder.encode(dto.password()));
            }

            if (dto.userStatus() != null) {
                entity.setUserStatus(dto.userStatus());
            }

            if (dto.roles() != null && !dto.roles().isEmpty()) {
                entity.getRoles().clear();
                for (RoleDTO roleDto : dto.roles()) {
                    Role role = roleRepository.findById(roleDto.id())
                            .orElseThrow(() -> new ResourceNotFoundException("Role não encontrada"));
                    entity.getRoles().add(role);
                }
            }

            enforcePhoneForClientOrAdmin(entity);
            entity = repository.save(entity);
            return new UserDTO(entity);

        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Id not found " + id);
        }
    }

    /**
     * Atualiza o perfil do próprio usuário autenticado. Diferente de {@link #update},
     * NÃO aceita {@code userStatus}/{@code roles}/{@code password} (o {@link ProfileUpdateDTO}
     * sequer os expõe), evitando escalonamento de privilégio na rota self.
     */
    @Transactional
    public UserDTO updateMe(ProfileUpdateDTO dto) {
        User entity = repository.findById(authService.authenticated().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        // colunas UNIQUE (cpf/phone): valida antes p/ devolver 400 em vez de 500 do banco
        ensureCpfAvailable(dto.cpf(), entity.getId());
        ensurePhoneAvailable(dto.phoneNumber(), entity.getId());

        copyDtoToEntity(dto, entity);
        enforcePhoneForClientOrAdmin(entity);
        entity = repository.save(entity);
        return new UserDTO(entity);
    }

    /**
     * Troca a senha do próprio usuário autenticado. Exige a senha atual (prova de posse)
     * e rejeita nova senha igual à anterior. Contas OAuth-only (senha aleatória) não casam
     * a senha atual e, portanto, não trocam senha por aqui.
     */
    @Transactional
    public void changeMyPassword(ChangePasswordDTO dto) {
        User entity = repository.findById(authService.authenticated().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        if (!passwordEncoder.matches(dto.currentPassword(), entity.getPassword())) {
            throw new BusinessException("Senha atual incorreta.");
        }
        if (passwordEncoder.matches(dto.newPassword(), entity.getPassword())) {
            throw new BusinessException("A nova senha não pode ser igual à senha anterior.");
        }

        entity.setPassword(passwordEncoder.encode(dto.newPassword()));
        repository.save(entity);
    }

    private void ensureEmailAvailable(String rawEmail, UUID selfId) {
        if (rawEmail == null || rawEmail.isBlank()) {
            return;
        }
        repository.findByEmail(rawEmail.trim().toLowerCase()).ifPresent(other -> {
            if (!other.getId().equals(selfId)) {
                throw new BusinessException("E-mail já cadastrado.");
            }
        });
    }

    private void ensureCpfAvailable(String rawCpf, UUID selfId) {
        if (rawCpf == null) {
            return;
        }
        String digitsOnly = rawCpf.replaceAll("[^0-9]", "");
        if (digitsOnly.isEmpty()) {
            return;
        }
        repository.findByCpf(digitsOnly).ifPresent(other -> {
            if (!other.getId().equals(selfId)) {
                throw new BusinessException("CPF já cadastrado.");
            }
        });
    }

    private void ensurePhoneAvailable(String rawPhone, UUID selfId) {
        if (rawPhone == null || rawPhone.isBlank()) {
            return;
        }
        repository.findByPhone(rawPhone.trim()).ifPresent(other -> {
            if (!other.getId().equals(selfId)) {
                throw new BusinessException("Telefone já cadastrado.");
            }
        });
    }

    @Transactional
    public void delete(UUID id) {
        try {
            User entity = repository.getReferenceById(id);
            User currentUser = authService.authenticated();

            if (currentUser.getId().equals(id)) {
                throw new ForbiddenException("Você não pode excluir a si mesmo.");
            }

            entity.setDeletedAt(Instant.now());
            entity.setUserStatus(UserStatus.DISABLED);

            long timestamp = System.currentTimeMillis();
            entity.setEmail("deleted_" + timestamp + "_" + entity.getEmail());
            if (entity.getCpf() != null) {
                entity.setCpf("del_" + timestamp + "_" + entity.getCpf());
            }
            if (entity.getPhone() != null) {
                entity.setPhone("del_" + timestamp + "_" + entity.getPhone());
            }

            repository.save(entity);

        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Id not found " + id);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException("Falha de integridade referencial");
        }
    }

    private void copyDtoToEntity(UserData dto, User entity) {
        if (dto.name() != null) {
            entity.setName(dto.name().trim());
        }
        if (dto.cpf() != null) {
            String digitsOnly = dto.cpf().replaceAll("[^0-9]", "");
            entity.setCpf(digitsOnly.isEmpty() ? null : digitsOnly);
        }
        if (dto.phoneNumber() != null) {
            String trimmed = dto.phoneNumber().trim();
            entity.setPhone(trimmed.isEmpty() ? null : trimmed);
        }
        if (dto.email() != null) {
            entity.setEmail(dto.email().trim().toLowerCase());
        }
    }

    private void validateRoleAssignment(Set<RoleDTO> targetRoles) {
        if (targetRoles == null || targetRoles.isEmpty()) {
            return;
        }

        User currentUser = safeCurrentUser();
        boolean isAdmin = currentUser != null &&
                currentUser.getRoles().stream()
                        .anyMatch(r -> r.getAuthority().equals(RoleConstants.ROLE_ADMIN));

        boolean targetHasAdmin = targetRoles.stream()
                .anyMatch(r -> RoleConstants.ROLE_ADMIN.equals(r.authority()));

        if (targetHasAdmin && !isAdmin) {
            throw new ForbiddenException(
                    "Apenas um Administrador (ADM) pode conceder privilégios de Administrador.");
        }
    }

    private User safeCurrentUser() {
        try {
            return authService.authenticated();
        } catch (Exception e) {
            return null;
        }
    }
}
