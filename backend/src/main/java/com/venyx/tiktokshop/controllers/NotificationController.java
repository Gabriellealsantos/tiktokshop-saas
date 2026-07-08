package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.CreateNotificationDTO;
import com.venyx.tiktokshop.dtos.NotificationDTO;
import com.venyx.tiktokshop.dtos.NotificationScheduleDTO;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.NotificationScheduleService;
import com.venyx.tiktokshop.services.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * Notificações in-app (sino). Rotas de leitura/marcação são do usuário logado;
 * o envio manual e as campanhas agendadas são só do admin (ADM).
 */
@RestController
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationScheduleService scheduleService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService,
                                  NotificationScheduleService scheduleService,
                                  AuthService authService) {
        this.notificationService = notificationService;
        this.scheduleService = scheduleService;
        this.authService = authService;
    }

    // ----- Usuário logado -----

    @GetMapping("/api/notifications")
    public ResponseEntity<Page<NotificationDTO>> feed(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(notificationService.feedForUser(authService.authenticated(), pageable));
    }

    @GetMapping("/api/notifications/unread-count")
    public ResponseEntity<Long> unreadCount() {
        return ResponseEntity.ok(notificationService.unreadCount(authService.authenticated()));
    }

    @PostMapping("/api/notifications/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(authService.authenticated(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/notifications/read-all")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllRead(authService.authenticated());
        return ResponseEntity.noContent().build();
    }

    // ----- Admin: envio manual e histórico -----

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @PostMapping("/api/admin/notifications")
    public ResponseEntity<NotificationDTO> create(@RequestBody CreateNotificationDTO dto) {
        NotificationDTO created = notificationService.createAndDispatch(dto, authService.authenticated());
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().build().toUri();
        return ResponseEntity.created(uri).body(created);
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @GetMapping("/api/admin/notifications")
    public ResponseEntity<Page<NotificationDTO>> history(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(notificationService.adminHistory(PageRequest.of(page, size)));
    }

    // ----- Admin: campanhas recorrentes -----

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @GetMapping("/api/admin/notifications/schedules")
    public ResponseEntity<List<NotificationScheduleDTO>> listSchedules() {
        return ResponseEntity.ok(scheduleService.list());
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @PostMapping("/api/admin/notifications/schedules")
    public ResponseEntity<NotificationScheduleDTO> createSchedule(@RequestBody NotificationScheduleDTO dto) {
        NotificationScheduleDTO created = scheduleService.create(dto, authService.authenticated());
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(uri).body(created);
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @PutMapping("/api/admin/notifications/schedules/{id}")
    public ResponseEntity<NotificationScheduleDTO> updateSchedule(@PathVariable Long id,
                                                                  @RequestBody NotificationScheduleDTO dto) {
        return ResponseEntity.ok(scheduleService.update(id, dto));
    }

    @PreAuthorize("hasRole('" + RoleConstants.ROLE_ADMIN + "')")
    @DeleteMapping("/api/admin/notifications/schedules/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        scheduleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
