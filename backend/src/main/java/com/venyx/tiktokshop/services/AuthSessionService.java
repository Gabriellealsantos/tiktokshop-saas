package com.venyx.tiktokshop.services;

import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Encerramento de autorizações OAuth2 (logout).
 *
 * Separado do {@link AuthSecurityService} de propósito: aquele é injetado nos
 * handlers de login, que são construídos pelo AuthorizationServerConfig — que por
 * sua vez é quem define o bean OAuth2AuthorizationService. Juntar as duas coisas
 * no mesmo serviço fecha um ciclo de dependências e o contexto não sobe.
 */
@Service
public class AuthSessionService {

    private final OAuth2AuthorizationService authorizationService;

    public AuthSessionService(OAuth2AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    /**
     * Encerra a autorização do token informado — é isto que libera a conta na hora
     * quando o usuário clica em "Sair".
     *
     * Não dá pra depender do /oauth2/revoke padrão aqui: o client é público (sem
     * secret no browser) e a revogação exige autenticação de client, então aquela
     * chamada sempre cai em 302 pro /login sem revogar nada. Como o chamador já
     * provou posse do access token (Bearer), remover a autorização dele é seguro.
     *
     * Remove só a autorização daquele token, não todas as do usuário: com a sessão
     * única desligada alguém pode ter duas sessões legítimas, e sair de uma não
     * deve derrubar a outra.
     */
    @Transactional
    public void revokeAuthorization(String accessTokenValue) {
        if (accessTokenValue == null || accessTokenValue.isBlank()) {
            return;
        }
        OAuth2Authorization authorization =
                authorizationService.findByToken(accessTokenValue, OAuth2TokenType.ACCESS_TOKEN);
        if (authorization != null) {
            authorizationService.remove(authorization);
        }
    }
}
