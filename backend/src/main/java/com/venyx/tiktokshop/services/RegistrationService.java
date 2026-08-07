package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.RegisterDTO;
import com.venyx.tiktokshop.entities.EmailConfirmation;
import com.venyx.tiktokshop.entities.Role;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.UserStatus;
import com.venyx.tiktokshop.repositories.EmailConfirmationRepository;
import com.venyx.tiktokshop.repositories.RoleRepository;
import com.venyx.tiktokshop.repositories.UserRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Auto-cadastro público: cria a conta como PENDING_CONFIRMATION e dispara o e-mail
 * de confirmação. A ativação muda o status para ACTIVE.
 */
@Service
public class RegistrationService {

    private static final Logger logger = LoggerFactory.getLogger(RegistrationService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmailConfirmationRepository emailConfirmationRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public RegistrationService(UserRepository userRepository,
                               RoleRepository roleRepository,
                               EmailConfirmationRepository emailConfirmationRepository,
                               PasswordEncoder passwordEncoder,
                               EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.emailConfirmationRepository = emailConfirmationRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public void register(RegisterDTO dto) {
        String email = dto.email().trim().toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new BusinessException("Já existe um usuário com este e-mail.");
        }

        User user = new User();
        user.setName(dto.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setUserStatus(UserStatus.PENDING_CONFIRMATION);

        if (dto.phone() != null && !dto.phone().isBlank()) {
            user.setPhone(dto.phone().trim());
        }
        if (dto.cpf() != null && !dto.cpf().isBlank()) {
            String digits = dto.cpf().replaceAll("[^0-9]", "");
            if (!digits.isEmpty()) {
                user.setCpf(digits);
            }
        }

        Role clientRole = roleRepository.findByAuthority(RoleConstants.ROLE_CLIENT)
                .orElseThrow(() -> new ResourceNotFoundException("Role ROLE_CLIENT não encontrada."));
        user.addRole(clientRole);

        user = userRepository.save(user);

        EmailConfirmation confirmation = new EmailConfirmation(
                user, Instant.now().plus(24, ChronoUnit.HOURS));
        emailConfirmationRepository.save(confirmation);

        logger.info("Conta criada para {}. Token de confirmação: {}", user.getEmail(), confirmation.getToken());
    }

    @Transactional
    public void confirm(String token) {
        EmailConfirmation confirmation = emailConfirmationRepository
                .findValidByToken(token, Instant.now())
                .orElseThrow(() -> new ResourceNotFoundException("Token de confirmação inválido ou expirado."));

        User user = confirmation.getUser();
        user.setUserStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        confirmation.setConfirmedAt(Instant.now());
        emailConfirmationRepository.save(confirmation);
    }
}
