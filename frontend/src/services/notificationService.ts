import { requestBackend } from "../utils/requests";

/** Espelha NotificationType do back. */
export type BackendNotificationType = "SALE" | "ANNOUNCEMENT" | "SYSTEM";

/** Espelha NotificationDTO do back. id vem nulo no toast efêmero de venda. */
export type NotificationResponse = {
  id: number | null;
  type: BackendNotificationType;
  title: string;
  body: string | null;
  imageUrl: string | null;
  clickUrl: string | null;
  createdAt: string;
  read: boolean;
};

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
