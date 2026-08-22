package com.venyx.tiktokshop.config.websocket;

import org.jspecify.annotations.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;

/**
 * Autentica a conexão STOMP no frame CONNECT (não no handshake HTTP do
 * WebSocket, que não permite headers customizados a partir do browser).
 * Espera o header "Authorization: Bearer {token}" dentro do próprio frame
 * CONNECT, valida com o JwtDecoder já usado pelo Resource Server e associa
 * o UUID do usuário (claim "uid") como Principal da sessão STOMP — necessário
 * para SimpMessagingTemplate.convertAndSendToUser(...) funcionar.
 */
@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketAuthChannelInterceptor.class);


    private final JwtDecoder jwtDecoder;

    public WebSocketAuthChannelInterceptor(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.warn("[WS] CONNECT recusado: header Authorization ausente ou malformado");
                throw new AuthenticationCredentialsNotFoundException("Token JWT ausente no CONNECT do WebSocket.");
            }

            Jwt jwt;
            try {
                jwt = jwtDecoder.decode(authHeader.substring(7));
            } catch (JwtException e) {
                logger.warn("[WS] CONNECT recusado: token inválido — {}", e.getMessage());
                throw new AuthenticationCredentialsNotFoundException("Token JWT inválido no CONNECT do WebSocket.", e);
            }

            String uid = jwt.getClaimAsString("uid");
            if (uid == null) {
                logger.warn("[WS] CONNECT recusado: token sem claim 'uid'");
                throw new AuthenticationCredentialsNotFoundException("Token JWT sem claim 'uid'.");
            }

            logger.debug("[WS] CONNECT aceito para uid={}", uid);
            accessor.setUser(new UsernamePasswordAuthenticationToken(uid, null, List.of()));
        }

        return message;
    }
}
