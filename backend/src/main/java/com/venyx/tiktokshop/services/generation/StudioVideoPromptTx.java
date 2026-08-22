package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.entities.CreationSession;
import com.venyx.tiktokshop.entities.enums.CreationStatus;
import com.venyx.tiktokshop.repositories.CreationSessionRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class StudioVideoPromptTx {

    private final CreationSessionRepository sessionRepository;

    public StudioVideoPromptTx(CreationSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> loadContext(Long sessionId, UUID userId) {
        CreationSession session = sessionRepository.findByIdAndUser_Uuid(sessionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Sessão não encontrada: " + sessionId));

        if (session.getStatus() != CreationStatus.COMPLETED || session.getConfig().get("imageUrl") == null) {
            throw new BusinessException("Gere a imagem antes de gerar o prompt do vídeo.");
        }
        if (session.getConfig().get("productName") == null) {
            throw new BusinessException("Sessão sem produto associado.");
        }
        return new HashMap<>(session.getConfig());
    }

    @Transactional
    public CreationSession saveResult(Long sessionId, UUID userId, String script,
                                      String voice, String videoPrompt) {
        CreationSession session = sessionRepository.findByIdAndUser_Uuid(sessionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Sessão não encontrada: " + sessionId));

        session.getConfig().put("script", script);
        session.getConfig().put("voice", voice);
        session.getConfig().put("videoPrompt", videoPrompt);
        return sessionRepository.save(session);
    }
}
