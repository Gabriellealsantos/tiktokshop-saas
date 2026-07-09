package com.venyx.tiktokshop.config.security.oauth2.social;

import com.venyx.tiktokshop.entities.Role;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.UserStatus;
import com.venyx.tiktokshop.repositories.RoleRepository;
import com.venyx.tiktokshop.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service que processa o login social (Google).
 *
 * Fluxo:
 * 1. Google retorna os dados do usuário (e-mail, nome, foto).
 * 2. Buscamos no banco pelo e-mail.
 *    - Se existir → usa o User com as roles existentes (ADM/Afiliado continuam iguais).
 *    - Se não existir → cria um novo User com ROLE_CLIENT e UserStatus.ACTIVE.
 * 3. Retorna um OidcUser com as authorities do nosso sistema.
 */
@Service
public class CustomOAuth2UserService extends OidcUserService {

    private static final Logger log = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomOAuth2UserService(UserRepository userRepository,
                                   RoleRepository roleRepository,
                                   PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        // Delega ao OidcUserService padrão para buscar as claims do Google
        OidcUser oidcUser = super.loadUser(userRequest);

        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("O Google não retornou um e-mail válido.");
        }

        email = email.trim().toLowerCase();

        // Busca ou cria o usuário no nosso banco
        User user = findOrCreateUser(email, name);

        // Converte as roles do nosso sistema em GrantedAuthority
        Set<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getAuthority()))
                .collect(Collectors.toSet());

        // Retorna um OidcUser com as claims do Google + authorities do BarGestor
        return new DefaultOidcUser(
                authorities,
                oidcUser.getIdToken(),
                oidcUser.getUserInfo()
        );
    }

    private User findOrCreateUser(String email, String name) {
        Optional<User> existing = userRepository.findByEmailWithRoles(email);

        if (existing.isPresent()) {
            log.info("Login social: usuário existente encontrado — email={}", email);
            return existing.get();
        }

        // Usuário novo → cadastro automático como CLIENT
        log.info("Login social: criando novo usuário — email={}, name={}", email, name);

        Role clientRole = roleRepository.findByAuthority(RoleConstants.ROLE_CLIENT)
                .orElseThrow(() -> new OAuth2AuthenticationException(
                        "Configuração do sistema incompleta: ROLE_CLIENT não encontrada."));

        User newUser = new User();
        newUser.setName(name != null ? name : email.split("@")[0]);
        newUser.setEmail(email);
        // Senha aleatória — usuário Google nunca usa senha direta
        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        newUser.setUserStatus(UserStatus.ACTIVE);
        newUser.addRole(clientRole);

        return userRepository.save(newUser);
    }
}
