package com.venyx.tiktokshop.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/**
 * Configuração do Servidor de Recursos (Resource Server).
 * Define as regras de segurança para os endpoints da API, o processador de JWT
 * e as configurações de CORS.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class ResourceServerConfig {

    @Value("${cors.origins}")
    private String corsOrigins;

    private final Environment env;

    public ResourceServerConfig(Environment env) {
        this.env = env;
    }

    /**
     * CONFIGURAÇÃO ESPECÍFICA PARA O H2 CONSOLE
     */
    @Bean
    @Order(-1)
    @ConditionalOnProperty(value = "spring.h2.console.enabled", havingValue = "true", matchIfMissing = false)
    public SecurityFilterChain h2SecurityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher("/h2-console/**")
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()));
        return http.build();
    }

    /**
     * API CONFIGURATION (Resource Server)
     * ORDEM ALTERADA PARA 2 (Antes do Login Padrão)
     * 
     * Configura a segurança das rotas da API (Resource Server), definindo
     * quais endpoints requerem autenticação e como o JWT será validado.
     */
    @Bean
    @Order(2)
    public SecurityFilterChain rsSecurityFilterChain(HttpSecurity http) throws Exception {

        boolean isTestProfile = Arrays.asList(env.getActiveProfiles()).contains("test");

        // Esta cadeia cuida APENAS da API
        http.securityMatcher("/api/**", "/auth/**", "/users/**", "/mfa/**", "/ws/**");

        http.authorizeHttpRequests(authorize -> {
            authorize.requestMatchers(
                    "/auth/**",
                    "/users/confirm",
                    "/api/auth/register",
                    "/api/auth/confirm",
                    "/api/auth/resend-confirmation",
                    "/ws/**"
            ).permitAll();

            if (isTestProfile) {
                authorize.anyRequest().permitAll();
            } else {
                authorize.anyRequest().authenticated();
            }
        });

        http.oauth2ResourceServer(oauth2ResourceServer -> oauth2ResourceServer
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        http.csrf(AbstractHttpConfigurer::disable);
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.requestCache(cache -> cache.disable());

        http.headers(headers -> headers
                .contentTypeOptions(Customizer.withDefaults())
                .frameOptions(frame -> frame.deny())
                .contentSecurityPolicy(csp -> csp
                        .policyDirectives("default-src 'self'; frame-ancestors 'none'; form-action 'self';"))
                .httpStrictTransportSecurity(hsts -> hsts
                        .includeSubDomains(true)
                        .maxAgeInSeconds(31536000)));

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthoritiesClaimName("authorities");
        grantedAuthoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        String[] origins = corsOrigins.split(",");
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOriginPatterns(Arrays.asList(origins));
        corsConfig.setAllowedMethods(Arrays.asList("POST", "GET", "PUT", "DELETE", "PATCH", "OPTIONS"));
        corsConfig.setAllowCredentials(true);
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return source;
    }

    @Bean(name = "customCorsFilterRegistration")
    public FilterRegistrationBean<CorsFilter> corsFilterRegistration() {
        FilterRegistrationBean<CorsFilter> registrationBean = new FilterRegistrationBean<>(
                new CorsFilter(corsConfigurationSource()));
        registrationBean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registrationBean;
    }
}
