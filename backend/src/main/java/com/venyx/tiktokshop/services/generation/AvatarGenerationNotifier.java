package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.ImageGenerationDTO;
import com.venyx.tiktokshop.entities.ImageGeneration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AvatarGenerationNotifier {

    private static final Logger log = LoggerFactory.getLogger(AvatarGenerationNotifier.class);
    private static final String DESTINATION = "/queue/avatar-status";

    private final SimpMessagingTemplate messagingTemplate;

    public AvatarGenerationNotifier(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notifyReady(UUID userUuid, ImageGeneration job) {
        try {
            log.info("[STOMP] enviando status={} jobId={} para user={}",
                    job.getStatus(), job.getId(), userUuid);
            messagingTemplate.convertAndSendToUser(
                    userUuid.toString(),
                    DESTINATION,
                    new ImageGenerationDTO(job));
        } catch (Exception e) {
            log.warn("Falha ao notificar geração via STOMP jobId={} user={}", job.getId(), userUuid, e);
        }
    }
}
