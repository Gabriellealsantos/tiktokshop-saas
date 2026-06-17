package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.EmailDTO;
import com.venyx.tiktokshop.dtos.NewPasswordDTO;
import com.venyx.tiktokshop.entities.PasswordRecover;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.repositories.PasswordRecoverRepository;
import com.venyx.tiktokshop.repositories.UserRepository;
import com.venyx.tiktokshop.services.exceptions.ForbiddenException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService implements UserDetailsService {

	private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

	@Value("${spring.mail.username}")
	private String defaultSender;

	@Value("${email.password-recover.uri}")
	private String recoverUri;

	@Value("${email.password-recover.token.minutes}")
	private Long tokenMinutes;

	private final PasswordEncoder passwordEncoder;

	private final PasswordRecoverRepository passwordRecoverRepository;

	private final UserRepository userRepository;

	private final EmailService emailService;

	public AuthService(PasswordEncoder passwordEncoder, PasswordRecoverRepository passwordRecoverRepository,
					   UserRepository userRepository, EmailService emailService) {
		this.passwordEncoder = passwordEncoder;
		this.passwordRecoverRepository = passwordRecoverRepository;
		this.userRepository = userRepository;
		this.emailService = emailService;
	}

	@Override
	@Transactional(readOnly = true)
	public UserDetails loadUserByUsername(String input) throws UsernameNotFoundException {
		if (input == null || input.isBlank()) {
			throw new UsernameNotFoundException("Usuário não pode ser vazio.");
		}

		User user;

		if (input.contains("@")) {
			user = userRepository.findByEmailWithRoles(input)
					.orElseThrow(() -> new UsernameNotFoundException("Email não encontrado: " + input));
		} else {
			String digits = input.replaceAll("\\D", "");

			// Tenta buscar por CPF primeiro. Se não encontrar, tenta por telefone.
			user = userRepository.findByCpfWithRoles(digits)
					.orElseGet(() -> userRepository.findByPhoneWithRoles(digits)
							.orElseThrow(() -> new UsernameNotFoundException("CPF ou Telefone não encontrado.")));
		}

		var authorities = user.getRoles().stream()
				.map(role -> new SimpleGrantedAuthority(role.getAuthority()))
				.collect(Collectors.toSet());

		return new org.springframework.security.core.userdetails.User(
				user.getEmail(),
				user.getPassword(),
				user.isEnabled(),
				true,
				true,
				true,
				authorities
		);
	}

	@Transactional
	public void handleFailedLoginAttempt(User user) {
		logger.warn("Tentativa de login falha para o usuário: {}", user.getEmail());

		int currentAttempts = user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts();
		int newAttemptCount = currentAttempts + 1;
		user.setFailedLoginAttempts(newAttemptCount);

		if (newAttemptCount >= 5) {
			logger.error("CONTA BLOQUEADA por excesso de tentativas para o usuário: {}",
					user.getEmail());
			// Bloqueia por 15 minutos (900 segundos)
			user.setLockoutEndTime(Instant.now().plusSeconds(900));
		}

		userRepository.save(user);
	}

	@Transactional
	public void handleSuccessfulLogin(User user) {
		if ((user.getFailedLoginAttempts() != null && user.getFailedLoginAttempts() > 0)
				|| user.getLockoutEndTime() != null) {

			logger.info("Login bem-sucedido para {}. Resetando contadores de falha.",
					user.getEmail());
			user.setFailedLoginAttempts(0);
			user.setLockoutEndTime(null);
			userRepository.save(user);
		}
	}

	@Transactional
	public void createRecoverToken(EmailDTO body) {
		Optional<User> userOptional = userRepository.findByEmail(body.email());

		if (userOptional.isPresent()) {
			User user = userOptional.get();
			String token = UUID.randomUUID().toString();

			PasswordRecover entity = new PasswordRecover();
			entity.setToken(token);
			entity.setExpiration(Instant.now().plusSeconds(tokenMinutes * 60L));
			entity.setUser(user);
			passwordRecoverRepository.save(entity);

			String text = "Acesse o link para definir uma nova senha (válido por " + tokenMinutes + " minutos):\n\n"
					+ recoverUri + token;

			emailService.sendEmail(body.email(), "Recuperação de senha", text);
		}
	}

	@Transactional
	public void saveNewPassword(NewPasswordDTO body) {
		List<PasswordRecover> list = passwordRecoverRepository.searchValidTokens(body.token(), Instant.now());

		if (list.isEmpty()) {
			throw new ResourceNotFoundException("Invalid token");
		}

		PasswordRecover recoverEntity = list.getFirst();
		User user = recoverEntity.getUser();

		if (passwordEncoder.matches(body.password(), user.getPassword())) {
			throw new IllegalArgumentException("A nova senha não pode ser igual à senha anterior.");
		}

		user.setPassword(passwordEncoder.encode(body.password()));
		userRepository.save(user);
		passwordRecoverRepository.delete(recoverEntity);
	}

	@Transactional(readOnly = true)
	public User authenticated() {
		try {
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			Jwt jwtPrincipal = (Jwt) authentication.getPrincipal();
			String username = jwtPrincipal.getClaim("username");
			return userRepository.findByEmailWithRoles(username)
					.orElseThrow(() -> new UsernameNotFoundException(
							"Usuário do token JWT não encontrado no banco de dados"));
		} catch (Exception e) {
			throw new UsernameNotFoundException("Invalid user");
		}
	}

	/**
	 * Valida: self OU admin OU SUPER_ADMIN.
	 */
	public void validateSelfOrAdmin(UUID targetUserId) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication.getAuthorities().stream()
				.anyMatch(a -> a.getAuthority().equals(RoleConstants.ROLE_SUPER_ADMIN))) {
			return;
		}

		Jwt jwtPrincipal = (Jwt) authentication.getPrincipal();
		String userIdClaim = jwtPrincipal.getClaimAsString("uid");
		UUID authenticatedUserId = userIdClaim != null ? UUID.fromString(userIdClaim) : null;

		if (authenticatedUserId != null && authenticatedUserId.equals(targetUserId)) {
			return;
		}

		boolean isAdmin = authentication.getAuthorities().stream()
				.anyMatch(a -> a.getAuthority().equals(RoleConstants.ROLE_ADMIN));

		if (!isAdmin) {
			throw new ForbiddenException("Acesso negado.");
		}
	}

	/**
	 * Verifica se o usuário logado possui a role informada.
	 */
	public boolean hasRole(String role) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null) return false;
		return authentication.getAuthorities().stream()
				.anyMatch(a -> role.equals(a.getAuthority()));
	}

}
