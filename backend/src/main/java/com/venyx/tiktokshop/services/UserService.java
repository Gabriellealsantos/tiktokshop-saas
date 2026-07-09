package com.venyx.tiktokshop.services;

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

    // Roles que exigem telefone. OPERATOR e SUPER_ADMIN ficam de fora.
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

        boolean isPrivileged = current != null && (
                current.hasRole(RoleConstants.ROLE_SUPER_ADMIN) ||
                current.hasRole(RoleConstants.ROLE_ADMIN)
        );

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

            User currentUser = safeCurrentUser();
            boolean currentIsSuperAdmin = currentUser != null
                    && currentUser.hasRole(RoleConstants.ROLE_SUPER_ADMIN);
            boolean targetIsSuperAdmin = entity.hasRole(RoleConstants.ROLE_SUPER_ADMIN);

            if (targetIsSuperAdmin && !currentIsSuperAdmin) {
                throw new ForbiddenException(
                        "Apenas o Super Administrador pode editar um Super Administrador.");
            }

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

    @Transactional
    public void delete(UUID id) {
        try {
            User entity = repository.getReferenceById(id);
            User currentUser = authService.authenticated();

            boolean currentIsSuperAdmin = currentUser.hasRole(RoleConstants.ROLE_SUPER_ADMIN);
            boolean targetIsSuperAdmin = entity.hasRole(RoleConstants.ROLE_SUPER_ADMIN);
            boolean targetIsAdmin = entity.hasRole(RoleConstants.ROLE_ADMIN);

            if (currentUser.getId().equals(id)) {
                throw new ForbiddenException("Você não pode excluir a si mesmo.");
            }
            if (targetIsSuperAdmin) {
                throw new ForbiddenException("Não é permitido excluir um Super Administrador.");
            }
            if (targetIsAdmin && !currentIsSuperAdmin) {
                throw new ForbiddenException(
                        "Apenas o Super Administrador pode excluir um Administrador.");
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
        boolean isSuperAdmin = currentUser != null &&
                currentUser.getRoles().stream()
                        .anyMatch(r -> r.getAuthority().equals(RoleConstants.ROLE_SUPER_ADMIN));

        boolean targetHasPrivileged = targetRoles.stream()
                .anyMatch(r -> RoleConstants.ROLE_ADMIN.equals(r.authority())
                        || RoleConstants.ROLE_SUPER_ADMIN.equals(r.authority())
                        || RoleConstants.ROLE_AFFILIATE.equals(r.authority()));

        if (targetHasPrivileged && !isSuperAdmin) {
            throw new ForbiddenException(
                    "Apenas o Super Administrador pode conceder papéis privilegiados.");
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
