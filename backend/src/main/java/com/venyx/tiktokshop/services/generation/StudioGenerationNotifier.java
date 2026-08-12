package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.CreationSessionDTO;
import com.venyx.tiktokshop.entities.CreationSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class StudioGenerationNotifier {

    private static final Logger log = LoggerFactory.getLogger(StudioGenerationNotifier.class);
    private static final String DESTINATION = "/queue/studio-status";

    private final SimpMessagingTemplate messagingTemplate;

    public StudioGenerationNotifier(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notifyReady(UUID userUuid, CreationSession session) {
        try {
            log.debug("[STUDIO-STOMP] enviando status={} sessionId={} para user={}",
                    session.getStatus(), session.getId(), userUuid);
            messagingTemplate.convertAndSendToUser(
                    userUuid.toString(),
                    DESTINATION,
                    new CreationSessionDTO(session));
        } catch (Exception e) {
            log.warn("Falha ao notificar Studio via STOMP sessionId={} user={}", session.getId(), userUuid, e);
        }
    }
}
