package com.venyx.tiktokshop.config.websocket;

import org.jspecify.annotations.NonNull;
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
import org.springframework.stereotype.Component;

import java.security.Principal;

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
                throw new AuthenticationCredentialsNotFoundException("Token JWT ausente no CONNECT do WebSocket.");
            }

            Jwt jwt = jwtDecoder.decode(authHeader.substring(7));
            String uid = jwt.getClaimAsString("uid");
            if (uid == null) {
                throw new AuthenticationCredentialsNotFoundException("Token JWT sem claim 'uid'.");
            }

            Principal principal = new UsernamePasswordAuthenticationToken(uid, null, java.util.List.of());
            accessor.setUser(principal);
        }

        return message;
    }
}
