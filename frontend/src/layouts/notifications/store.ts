import { useEffect, useState } from "react";

import { subscribeTopic } from "@/utils/ws";
import { initNotificationSound, playForType } from "@/utils/notification-sound";
import { getAccessTokenPayload } from "@/utils/token";
import type { BackendNotificationType, NotificationResponse } from "@/models/notification";
import {
  getNotifications, getUnreadCount, markAllNotificationsRead, markNotificationRead,
} from "@/services/notificationService";

export type NotificationType = "venda" | "sistema" | "indicacao" | "info";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
  productImage?: string;
  isSale?: boolean;
}

// Só admin/afiliado recebem os toasts de venda ao vivo (prova social interna).
function canSeeSales(): boolean {
  const authorities = getAccessTokenPayload()?.authorities ?? [];
  return authorities.includes("ROLE_ADMIN") || authorities.includes("ROLE_AFFILIATE");
}

const TYPE_MAP: Record<BackendNotificationType, NotificationType> = {
  SALE: "venda",
  ANNOUNCEMENT: "info",
  SYSTEM: "sistema",
};

function mapDto(dto: NotificationResponse): AppNotification {
  return {
    id: dto.id != null ? String(dto.id) : `sale-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: dto.title,
    description: dto.body ?? "",
    type: TYPE_MAP[dto.type] ?? "info",
    read: dto.read,
    createdAt: dto.createdAt ?? new Date().toISOString(),
    link: dto.clickUrl ?? undefined,
    productImage: dto.imageUrl ?? undefined,
    isSale: dto.type === "SALE",
  };
}

/**
 * Store real do sino: puxa a caixa persistida (GET /api/notifications) e escuta o
 * WebSocket /topic/notifications. Vendas ao vivo (SALE) são efêmeras — ficam só em
 * memória e não contam no não-lido do servidor; avisos/sistema vêm persistidos.
 */
class NotificationsStore {
  private inbox: AppNotification[] = [];
  private sales: AppNotification[] = [];
  private unread = 0;
  private connected = false;
  private snapshot: AppNotification[] = [];
  private dirty = true;
  private listeners = new Set<() => void>();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    void this.connect();
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot() {
    if (this.dirty) {
      this.snapshot = [...this.sales, ...this.inbox].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      this.dirty = false;
    }
    return this.snapshot;
  }

  getUnreadCount() {
    return this.unread + this.sales.filter((s) => !s.read).length;
  }

  getLatestSale(): AppNotification | undefined {
    return this.sales[0];
  }

  markAsRead(id: string) {
    const sale = this.sales.find((s) => s.id === id);
    if (sale) {
      if (!sale.read) {
        sale.read = true;
        this.touch();
      }
      return;
    }
    const item = this.inbox.find((n) => n.id === id);
    if (item && !item.read) {
      item.read = true;
      this.unread = Math.max(0, this.unread - 1);
      markNotificationRead(Number(id)).catch(() => {});
      this.touch();
    }
  }

  markAllAsRead() {
    this.inbox.forEach((n) => (n.read = true));
    this.sales.forEach((s) => (s.read = true));
    this.unread = 0;
    markAllNotificationsRead().catch(() => {});
    this.touch();
  }

  dismiss(id: string) {
    this.sales = this.sales.filter((s) => s.id !== id);
    this.inbox = this.inbox.filter((n) => n.id !== id);
    this.touch();
  }

  private async connect() {
    if (this.connected) return;
    this.connected = true;
    // Pré-carrega a config de som (presets do dono + mute do usuário) para tocar sem latência.
    void initNotificationSound();
    try {
      const [feed, count] = await Promise.all([getNotifications(0, 20), getUnreadCount()]);
      this.inbox = (feed.data.content ?? []).map(mapDto);
      this.unread = typeof count.data === "number" ? count.data : 0;
      this.touch();
    } catch {
      // silencioso — mantém o estado vazio
    }
    subscribeTopic<NotificationResponse>("/topic/notifications", (dto) => this.onWs(dto));
  }

  private onWs(dto: NotificationResponse) {
    const item = mapDto(dto);
    if (dto.type === "SALE") {
      if (!canSeeSales()) return;
      item.read = false;
      this.sales = [item, ...this.sales].slice(0, 20);
    } else {
      this.inbox = [item, ...this.inbox];
      if (!item.read) this.unread += 1;
    }
    // Som por tipo de notificação (venda ≠ aviso ≠ sistema), respeitando kill switch + mute.
    playForType(dto.type);
    this.touch();
  }

  private touch() {
    this.dirty = true;
    this.listeners.forEach((l) => l());
  }
}

export const notificationsStore = new NotificationsStore();

export function useNotifications() {
  const [, force] = useState(0);

  useEffect(() => {
    return notificationsStore.subscribe(() => force((n) => n + 1));
  }, []);

  return {
    notifications: notificationsStore.getSnapshot(),
    unreadCount: notificationsStore.getUnreadCount(),
    latestSale: notificationsStore.getLatestSale(),
    markAsRead: (id: string) => notificationsStore.markAsRead(id),
    markAllAsRead: () => notificationsStore.markAllAsRead(),
    dismiss: (id: string) => notificationsStore.dismiss(id),
  };
}
