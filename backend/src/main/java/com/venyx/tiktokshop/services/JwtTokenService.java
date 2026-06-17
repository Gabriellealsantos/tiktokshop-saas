package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.entities.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

@Service
public class JwtTokenService {

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;

    @Value("${spring.application.name:bargestor-backend}")
    private String issuer;

    @Value("${security.jwt.duration:900}") // 15 minutos padrão
    private long jwtDurationSeconds;

    public JwtTokenService(JwtEncoder jwtEncoder, JwtDecoder jwtDecoder) {
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
    }

    public String generateToken(User user) {
        Instant now = Instant.now();

        // Escopos/Roles do usuário
        String scope = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(now.plus(jwtDurationSeconds, ChronoUnit.SECONDS))
                .subject(user.getEmail())
                .claim("uid", user.getUuid().toString()) // UUID do usuário
                .claim("scope", scope)
                .build();

        return this.jwtEncoder.encode(JwtEncoderParameters.from(JwsHeader.with(() -> "RS256").build(), claims)).getTokenValue();
    }

    public String generatePreAuthToken(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(now.plus(3, ChronoUnit.MINUTES))
                .subject(user.getEmail())
                .claim("pre_auth", true)
                .build();

        return this.jwtEncoder.encode(JwtEncoderParameters.from(JwsHeader.with(() -> "RS256").build(), claims)).getTokenValue();
    }

    public String validatePreAuthTokenAndGetEmail(String token) {
        try {
            Jwt jwt = jwtDecoder.decode(token);
            if (Boolean.TRUE.equals(jwt.getClaim("pre_auth"))) {
                return jwt.getSubject();
            }
            throw new IllegalArgumentException("Token fornecido não é de pré-autenticação.");
        } catch (Exception e) {
            throw new IllegalArgumentException("Token de pré-autenticação inválido ou expirado.");
        }
    }
}