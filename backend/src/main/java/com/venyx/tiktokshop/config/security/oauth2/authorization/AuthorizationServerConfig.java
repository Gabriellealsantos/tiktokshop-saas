package com.venyx.tiktokshop.config.security.oauth2.authorization;

import com.venyx.tiktokshop.config.security.handler.ContextAwareAuthenticationEntryPoint;
import com.venyx.tiktokshop.config.security.handler.ContextAwareAuthenticationFailureHandler;
import com.venyx.tiktokshop.config.security.handler.FederatedIdentitySuccessHandler;
import com.venyx.tiktokshop.config.security.handler.MfaAuthenticationSuccessHandler;
import com.venyx.tiktokshop.config.security.oauth2.pkce.OAuth2PublicClientRefreshTokenGenerator;
import com.venyx.tiktokshop.config.security.oauth2.pkce.PublicClientRefreshTokenAuthenticationConverter;
import com.venyx.tiktokshop.config.security.oauth2.pkce.PublicClientRefreshTokenAuthenticationProvider;
import com.venyx.tiktokshop.config.security.oauth2.social.CustomOAuth2UserService;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.repositories.UserRepository;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.authorization.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2Token;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.security.oauth2.server.authorization.token.*;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

/**
 * Configuração do Servidor de Autorização OAuth2.
 * Define os endpoints de login, emissão de tokens, o cliente registrado (SPA com PKCE)
 * e a customização das claims do JWT (inclusão de uid, username e autoridades).
 */
@Configuration
public class AuthorizationServerConfig {

        @Value("${security.client-id}")
        private String clientId;

        @Value("${security.client-secret}")
        private String clientSecret;

        @Value("${security.jwt.duration:900}")
        private Integer jwtDurationSeconds;

        @Value("${security.redirect-uri:http://localhost:5173/authorized}")
        private String redirectUri;

        @Value("${security.redirect-uri-app:tiktokshop://authorized}")
        private String redirectUriApp;

        @Value("${cors.origins:http://localhost:5173}")
        private String corsOrigins;

        private final MfaAuthenticationSuccessHandler mfaAuthenticationSuccessHandler;
        private final FederatedIdentitySuccessHandler federatedIdentitySuccessHandler;
        private final CustomOAuth2UserService customOAuth2UserService;
        private final PasswordEncoder passwordEncoder;

        public AuthorizationServerConfig(MfaAuthenticationSuccessHandler mfaAuthenticationSuccessHandler,
                                         FederatedIdentitySuccessHandler federatedIdentitySuccessHandler,
                                         CustomOAuth2UserService customOAuth2UserService,
                                         PasswordEncoder passwordEncoder) {
                this.mfaAuthenticationSuccessHandler = mfaAuthenticationSuccessHandler;
                this.federatedIdentitySuccessHandler = federatedIdentitySuccessHandler;
                this.customOAuth2UserService = customOAuth2UserService;
                this.passwordEncoder = passwordEncoder;
        }

        @Bean
        @Order(1)
        public SecurityFilterChain authorizationServerSecurityFilterChain(
                        HttpSecurity http,
                        RegisteredClientRepository registeredClientRepository) throws Exception {

                OAuth2AuthorizationServerConfigurer configurer = new OAuth2AuthorizationServerConfigurer();

                http.with(configurer, authorizationServer -> authorizationServer
                                .tokenRevocationEndpoint(Customizer.withDefaults())
                                .oidc(Customizer.withDefaults())
                                .clientAuthentication(clientAuth -> clientAuth
                                                .authenticationConverter(
                                                                new PublicClientRefreshTokenAuthenticationConverter())
                                                .authenticationProvider(
                                                                new PublicClientRefreshTokenAuthenticationProvider(
                                                                                registeredClientRepository))));

                http.cors(cors -> cors.configurationSource(authCorsConfigurationSource()));

                http.securityMatcher(configurer.getEndpointsMatcher())
                                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                                .exceptionHandling(ex -> ex.authenticationEntryPoint(
                                                new ContextAwareAuthenticationEntryPoint()))
                                .oauth2ResourceServer(rs -> rs.jwt(Customizer.withDefaults()));

                return http.build();
        }

        @Bean
        @Order(3)
        public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
                http.authorizeHttpRequests(auth -> auth
                                // Ignora requests do Chrome DevTools e outros well-known
                                .requestMatchers(
                                        "/.well-known/**",
                                        "/favicon.ico",
                                        "/error",
                                        "/csrf",
                                        "/actuator/health")
                                .permitAll()
                                // Recursos estáticos da página de login (CSS/logo/etc.)
                                .requestMatchers(
                                                "/css/**",
                                                "/js/**",
                                                "/images/**",
                                                "/logo-Sfundo.png",
                                                "/favicon.svg")
                                .permitAll()
                                .requestMatchers("/login").permitAll()
                                .anyRequest().authenticated())
                                .formLogin(form -> form
                                                .loginPage("/login")
                                                .failureHandler(new ContextAwareAuthenticationFailureHandler())
                                                .successHandler(mfaAuthenticationSuccessHandler))
                        .oauth2Login(oauth2 -> oauth2
                                .loginPage("/login")
                                .userInfoEndpoint(userInfo -> userInfo
                                        .oidcUserService(customOAuth2UserService))
                                .successHandler(federatedIdentitySuccessHandler))
                        .csrf(csrf -> csrf
                                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                                .ignoringRequestMatchers("/logout", "/login"))
                        .logout(logout -> logout
                                .logoutRequestMatcher(request -> request.getRequestURI().equals("/logout"))
                                .logoutSuccessHandler((request, response, authentication) -> {
                                        String origin = request.getHeader("Origin");
                                        if (origin != null && List.of(corsOrigins.split(",")).contains(origin)) {
                                                response.setHeader("Access-Control-Allow-Origin", origin);
                                                response.setHeader("Access-Control-Allow-Credentials", "true");
                                        }
                                        response.setStatus(200);
                                        response.setContentType("application/json");
                                        response.getWriter().write("{\"message\":\"session_ended\"}");
                                })
                                .invalidateHttpSession(true)
                                .clearAuthentication(true)
                                .deleteCookies("JSESSIONID", "XSRF-TOKEN"));
                return http.build();
        }

        @Bean
        @DependsOn("OAuth2SchemaInitializer")
        public RegisteredClientRepository registeredClientRepository(JdbcTemplate jdbcTemplate,
                        PasswordEncoder passwordEncoder) {
                JdbcRegisteredClientRepository repository = new JdbcRegisteredClientRepository(jdbcTemplate);

                // Limpa cliente antigo para evitar duplicação em ambiente de desenvolvimento
                RegisteredClient existing = repository.findByClientId(clientId);
                if (existing != null) {
                        jdbcTemplate.update("DELETE FROM oauth2_authorization WHERE registered_client_id = ?",
                                        existing.getId());
                        jdbcTemplate.update("DELETE FROM oauth2_authorization_consent WHERE registered_client_id = ?",
                                        existing.getId());
                        jdbcTemplate.update("DELETE FROM oauth2_registered_client WHERE id = ?", existing.getId());
                }

                RegisteredClient client = RegisteredClient.withId(UUID.randomUUID().toString())
                                .clientId(clientId)
                                .clientSecret(passwordEncoder.encode(clientSecret))
                                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                                .redirectUri(redirectUri)
                                .redirectUri(redirectUriApp)
                                .redirectUri("https://oauth.pstmn.io/v1/callback")
                                .scope(OidcScopes.OPENID)
                                .scope(OidcScopes.PROFILE)
                                .scope("read")
                                .scope("write")
                                .scope("offline_access")
                                .clientSettings(
                                                ClientSettings.builder().requireAuthorizationConsent(false)
                                                                .requireProofKey(true).build())
                                .tokenSettings(tokenSettings())
                                .build();

                repository.save(client);

                return repository;
        }

        @Bean
        public OAuth2AuthorizationService authorizationService(JdbcTemplate jdbcTemplate,
                        RegisteredClientRepository registeredClientRepository) {
                return new JdbcOAuth2AuthorizationService(jdbcTemplate, registeredClientRepository);
        }

        @Bean
        public OAuth2AuthorizationConsentService authorizationConsentService(JdbcTemplate jdbcTemplate,
                        RegisteredClientRepository registeredClientRepository) {
                return new JdbcOAuth2AuthorizationConsentService(jdbcTemplate, registeredClientRepository);
        }

        @Bean
        public OAuth2TokenCustomizer<JwtEncodingContext> tokenCustomizer(UserRepository userRepository) {
                return context -> {
                        if ("access_token".equals(context.getTokenType().getValue())) {
                                Authentication authentication = context.getPrincipal();
                                User user = null;
                                if (authentication.getPrincipal() instanceof UserDetails ud) {
                                        user = userRepository.findByEmailWithRoles(ud.getUsername())
                                                        .orElse(null);
                                }

                                if (user != null) {
                                        context.getClaims().claim("uid", user.getId().toString());
                                        context.getClaims().claim("username", user.getEmail());
                                        context.getClaims().claim("name",
                                                        user.getName() != null ? user.getName() : user.getEmail());
                                        context.getClaims().claim("phone", user.getPhone() != null ? user.getPhone() : "");

                                        java.util.Set<String> authorities = user.getAuthorities().stream()
                                                        .map(GrantedAuthority::getAuthority)
                                                        .collect(java.util.stream.Collectors.toSet());

                                        context.getClaims().claim("authorities", authorities);
                                }
                        }
                };
        }

        @Bean
        public TokenSettings tokenSettings() {
                return TokenSettings.builder()
                                .accessTokenTimeToLive(Duration.ofSeconds(jwtDurationSeconds))
                                .refreshTokenTimeToLive(Duration.ofDays(20))
                                .reuseRefreshTokens(false)
                                .build();
        }

        @Bean
        public OAuth2TokenGenerator<OAuth2Token> tokenGenerator(JWKSource<SecurityContext> jwkSource,
                        OAuth2TokenCustomizer<JwtEncodingContext> tokenCustomizer) {
                JwtGenerator jwtAccessTokenGenerator = new JwtGenerator(new NimbusJwtEncoder(jwkSource));
                jwtAccessTokenGenerator.setJwtCustomizer(tokenCustomizer);

                return new DelegatingOAuth2TokenGenerator(
                                jwtAccessTokenGenerator,
                                new OAuth2PublicClientRefreshTokenGenerator() // Nosso gerador customizado
                );
        }

        @Bean
        public AuthorizationServerSettings authorizationServerSettings() {
                return AuthorizationServerSettings.builder().build();
        }

        @Bean
        public CorsConfigurationSource authCorsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(List.of(corsOrigins.split(",")));
                configuration.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("*"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
