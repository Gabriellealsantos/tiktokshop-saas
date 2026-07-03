package com.venyx.tiktokshop.config;

import com.venyx.tiktokshop.entities.CreditWallet;
import com.venyx.tiktokshop.entities.Role;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.UserStatus;
import com.venyx.tiktokshop.repositories.CreditWalletRepository;
import com.venyx.tiktokshop.repositories.RoleRepository;
import com.venyx.tiktokshop.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Semeia usuários de teste em desenvolvimento (idempotente). As roles e os planos
 * vêm das migrations Flyway.
 */
@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    private static final String DEV_PASSWORD = "123456";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CreditWalletRepository creditWalletRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           RoleRepository roleRepository,
                           CreditWalletRepository creditWalletRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.creditWalletRepository = creditWalletRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedUser("superadmin@venyx.com", "Super Admin",
                List.of(RoleConstants.ROLE_SUPER_ADMIN, RoleConstants.ROLE_ADMIN), false);
        seedUser("admin@venyx.com", "Administrador",
                List.of(RoleConstants.ROLE_ADMIN), false);
        seedUser("client@venyx.com", "Cliente Teste",
                List.of(RoleConstants.ROLE_CLIENT), true);
    }

    private void seedUser(String email, String name, List<String> authorities, boolean withWallet) {
        if (userRepository.findByEmail(email).isPresent()) {
            return;
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(DEV_PASSWORD));
        user.setUserStatus(UserStatus.ACTIVE);

        for (String authority : authorities) {
            Role role = roleRepository.findByAuthority(authority).orElse(null);
            if (role == null) {
                logger.warn("Role {} não encontrada — pulei o seed de {}.", authority, email);
                return;
            }
            user.addRole(role);
        }

        user = userRepository.save(user);

        if (withWallet) {
            CreditWallet wallet = new CreditWallet(user, 100);
            creditWalletRepository.save(wallet);
        }

        logger.info("✅ Usuário de dev criado: {} (senha {})", email, DEV_PASSWORD);
    }
}
