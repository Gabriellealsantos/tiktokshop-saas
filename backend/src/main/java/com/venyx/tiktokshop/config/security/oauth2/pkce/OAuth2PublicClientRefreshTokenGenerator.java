package com.venyx.tiktokshop.config.security.oauth2.pkce;

import org.jspecify.annotations.Nullable;
import org.springframework.security.crypto.keygen.Base64StringKeyGenerator;
import org.springframework.security.crypto.keygen.StringKeyGenerator;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator;

import java.time.Instant;
import java.util.Base64;

/**
 * Gerador de refresh token customizado que PERMITE emissão para clients
 * públicos.
 * O gerador padrão do Spring (OAuth2RefreshTokenGenerator) bloqueia clients
 * públicos.
 * Esta classe remove essa restrição, mantendo o restante do comportamento.
 */
public class OAuth2PublicClientRefreshTokenGenerator implements OAuth2TokenGenerator<OAuth2RefreshToken> {

    private final StringKeyGenerator refreshTokenGenerator = new Base64StringKeyGenerator(
            Base64.getUrlEncoder().withoutPadding(), 96);

    @Nullable
    @Override
    public OAuth2RefreshToken generate(OAuth2TokenContext context) {
        // Só gera se o tipo solicitado for REFRESH_TOKEN
        if (!org.springframework.security.oauth2.server.authorization.OAuth2TokenType.REFRESH_TOKEN
                .equals(context.getTokenType())) {
            return null;
        }

        // NÃO tem o check "isPublicClientForAuthorizationCodeGrant" — essa é a
        // diferença
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(
                context.getRegisteredClient().getTokenSettings().getRefreshTokenTimeToLive());
        return new OAuth2RefreshToken(this.refreshTokenGenerator.generateKey(), issuedAt, expiresAt);
    }
}
