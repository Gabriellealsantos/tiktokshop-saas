package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Caixa do usuário: exclui SALE (efêmera), só o que é dele (ALL ou target seu) e
     * criado após o cadastro (não vê avisos anteriores a ele existir).
     */
    @Query("""
            SELECT n FROM Notification n
            WHERE n.type <> com.venyx.tiktokshop.entities.enums.NotificationType.SALE
              AND n.createdAt >= :since
              AND (n.audience = com.venyx.tiktokshop.entities.enums.NotificationAudience.ALL
                   OR EXISTS (SELECT 1 FROM NotificationTarget t
                              WHERE t.notification = n AND t.user.uuid = :userId))
            ORDER BY n.createdAt DESC
            """)
    Page<Notification> inbox(@Param("userId") UUID userId, @Param("since") Instant since, Pageable pageable);

    /** Itens da caixa ainda sem NotificationRead do usuário (usado por "marcar todas"). */
    @Query("""
            SELECT n FROM Notification n
            WHERE n.type <> com.venyx.tiktokshop.entities.enums.NotificationType.SALE
              AND n.createdAt >= :since
              AND (n.audience = com.venyx.tiktokshop.entities.enums.NotificationAudience.ALL
                   OR EXISTS (SELECT 1 FROM NotificationTarget t
                              WHERE t.notification = n AND t.user.uuid = :userId))
              AND NOT EXISTS (SELECT 1 FROM NotificationRead r
                              WHERE r.notification = n AND r.user.uuid = :userId)
            """)
    List<Notification> unreadInbox(@Param("userId") UUID userId, @Param("since") Instant since);

    @Query("""
            SELECT COUNT(n) FROM Notification n
            WHERE n.type <> com.venyx.tiktokshop.entities.enums.NotificationType.SALE
              AND n.createdAt >= :since
              AND (n.audience = com.venyx.tiktokshop.entities.enums.NotificationAudience.ALL
                   OR EXISTS (SELECT 1 FROM NotificationTarget t
                              WHERE t.notification = n AND t.user.uuid = :userId))
              AND NOT EXISTS (SELECT 1 FROM NotificationRead r
                              WHERE r.notification = n AND r.user.uuid = :userId)
            """)
    long unreadCount(@Param("userId") UUID userId, @Param("since") Instant since);

    /** Histórico de tudo que o admin enviou (todas as audiences/tipos). */
    Page<Notification> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
