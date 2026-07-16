import { requestBackend } from "../utils/requests";
import type { NotificationSoundSettings } from "@/models/notification";

// ── Notificações — chamadas HTTP ─────────────────────────────────────────────

/** Caixa do sino do usuário logado (paginada). */
export const getNotifications = (page = 0, size = 20) =>
  requestBackend({
    method: "GET",
    url: "/api/notifications",
    params: { page, size },
    withCredentials: true,
  });

export const getUnreadCount = () =>
  requestBackend({ method: "GET", url: "/api/notifications/unread-count", withCredentials: true });

export const markNotificationRead = (id: number) =>
  requestBackend({ method: "POST", url: `/api/notifications/${id}/read`, withCredentials: true });

export const markAllNotificationsRead = () =>
  requestBackend({ method: "POST", url: "/api/notifications/read-all", withCredentials: true });

// ─── Som das notificações ────────────────────────────────────────────────────

/** Config global — qualquer usuário logado lê para saber qual som tocar. */
export const getSoundSettings = () =>
  requestBackend({ method: "GET", url: "/api/notifications/sound-settings", withCredentials: true });

/** Admin: define os presets por tipo + kill switch global. */
export const updateSoundSettings = (dto: Partial<NotificationSoundSettings>) =>
  requestBackend({
    method: "PUT",
    url: "/api/admin/notifications/sound-settings",
    data: dto,
    withCredentials: true,
  });

/** Preferência pessoal de mute do usuário logado. */
export const getSoundPreference = () =>
  requestBackend({ method: "GET", url: "/api/notifications/preferences", withCredentials: true });

export const updateSoundPreference = (soundEnabled: boolean) =>
  requestBackend({
    method: "PUT",
    url: "/api/notifications/preferences",
    data: { soundEnabled },
    withCredentials: true,
  });
