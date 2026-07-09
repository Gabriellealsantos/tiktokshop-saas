package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.CreateNotificationDTO;
import com.venyx.tiktokshop.dtos.LiveSaleEventDTO;
import com.venyx.tiktokshop.dtos.NotificationDTO;
import com.venyx.tiktokshop.entities.Notification;
import com.venyx.tiktokshop.entities.NotificationRead;
import com.venyx.tiktokshop.entities.NotificationTarget;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.NotificationAudience;
import com.venyx.tiktokshop.entities.enums.NotificationType;
import com.venyx.tiktokshop.repositories.NotificationReadRepository;
import com.venyx.tiktokshop.repositories.NotificationRepository;
import com.venyx.tiktokshop.repositories.NotificationTargetRepository;
import com.venyx.tiktokshop.repositories.UserRepository;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import com.venyx.tiktokshop.services.exceptions.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Regras das notificações in-app (sino). Modelo: audience=ALL não faz fan-out (uma linha só,
 * "não-lido" = ausência em notification_reads); SELECTED usa notification_targets. A prova social
 * de venda (SALE) é efêmera: broadcast STOMP, não persiste nem entra na caixa.
 */
@Service
public class NotificationService {

    private static final String TOPIC = "/topic/notifications";
    private static final String USER_QUEUE = "/queue/notifications";

    private final NotificationRepository notificationRepository;
    private final NotificationTargetRepository targetRepository;
    private final NotificationReadRepository readRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationTargetRepository targetRepository,
                               NotificationReadRepository readRepository,
                               UserRepository userRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.targetRepository = targetRepository;
        this.readRepository = readRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public NotificationDTO createAndDispatch(CreateNotificationDTO dto, User admin) {
        if (dto.title() == null || dto.title().isBlank()) {
            throw new BusinessException("Título da notificação é obrigatório.");
        }
        NotificationAudience audience = dto.audience() != null ? dto.audience() : NotificationAudience.ALL;
        if (audience == NotificationAudience.SELECTED
                && (dto.targetUserIds() == null || dto.targetUserIds().isEmpty())) {
            throw new BusinessException("Público SELECTED exige ao menos um destinatário.");
        }

        Notification n = new Notification();
        n.setType(dto.type() != null ? dto.type() : NotificationType.ANNOUNCEMENT);
        n.setTitle(dto.title().trim());
        n.setBody(dto.body());
        n.setImageUrl(dto.imageUrl());
        n.setClickUrl(dto.clickUrl());
        n.setAudience(audience);
        n.setCreatedBy(admin);
        n = notificationRepository.save(n);

        NotificationDTO payload = toDTO(n, false);
        if (audience == NotificationAudience.SELECTED) {
            for (UUID uuid : dto.targetUserIds()) {
                targetRepository.save(new NotificationTarget(n, userRepository.getReferenceById(uuid)));
                messagingTemplate.convertAndSendToUser(uuid.toString(), USER_QUEUE, payload);
            }
        } else {
            messagingTemplate.convertAndSend(TOPIC, payload);
        }
        return payload;
    }

    @Transactional(readOnly = true)
    public Page<NotificationDTO> feedForUser(User user, Pageable pageable) {
        Instant since = user.getCreatedAt();
        return notificationRepository.inbox(user.getUuid(), since, pageable)
                .map(n -> toDTO(n, readRepository.existsByNotification_IdAndUser_Uuid(n.getId(), user.getUuid())));
    }

    @Transactional(readOnly = true)
    public long unreadCount(User user) {
        return notificationRepository.unreadCount(user.getUuid(), user.getCreatedAt());
    }

    /** Histórico de tudo que o admin enviou (read não se aplica aqui). */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> adminHistory(Pageable pageable) {
        return notificationRepository.findAllByOrderByCreatedAtDesc(pageable).map(n -> toDTO(n, false));
    }

    @Transactional
    public void markRead(User user, Long notificationId) {
        // Idempotente: se já leu, não faz nada (a UNIQUE constraint também protege contra corrida).
        if (readRepository.existsByNotification_IdAndUser_Uuid(notificationId, user.getUuid())) {
            return;
        }
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notificação não encontrada: " + notificationId));
        readRepository.save(new NotificationRead(n, user));
    }

    @Transactional
    public void markAllRead(User user) {
        List<NotificationRead> reads = notificationRepository.unreadInbox(user.getUuid(), user.getCreatedAt())
                .stream()
                .map(n -> new NotificationRead(n, user))
                .toList();
        readRepository.saveAll(reads);
    }

    /**
     * Prova social de venda ao vivo: monta um DTO transiente type=SALE e faz broadcast.
     * Não persiste — some do sino, é só um toast em tempo real para todos.
     */
    public void broadcastSaleToast(LiveSaleEventDTO sale) {
        NotificationDTO toast = new NotificationDTO(
                null,
                NotificationType.SALE,
                "Venda ao vivo",
                sale.productName() + " — R$ " + sale.amount(),
                sale.imageUrl(),
                null,
                Instant.now(),
                false);
        messagingTemplate.convertAndSend(TOPIC, toast);
    }

    private NotificationDTO toDTO(Notification n, boolean read) {
        return new NotificationDTO(
                n.getId(),
                n.getType(),
                n.getTitle(),
                n.getBody(),
                n.getImageUrl(),
                n.getClickUrl(),
                n.getCreatedAt(),
                read);
    }
}
