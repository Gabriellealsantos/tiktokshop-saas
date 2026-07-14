import { useState, useEffect } from "react";
import { Bell, Gift, Info, Settings, ShoppingBag, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Popover, PopoverContent, PopoverTrigger, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/utils/utils";

// --- STORE LOGIC (TODO: Connect to real backend) ---
export type NotificationType = "venda" | "sistema" | "indicacao" | "info";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
  // Sale specific (TODO: connect backend)
  productId?: string | number;
  productName?: string;
  productImage?: string;
  commission?: number;
  saleValue?: number;
}

class NotificationsStore {
  private notifications: AppNotification[] = [
    {
      id: "1",
      title: "Nova venda confirmada!",
      description: "Você recebeu uma comissão de R$ 47,90.",
      type: "venda",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      link: "/dashboard",
      productId: "p1",
      productName: "Sérum Vitamina C Glow",
      productImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=75",
      commission: 47.90,
      saleValue: 120.00
    },
    {
      id: "2",
      title: "Produto em alta",
      description: "O produto 'Sérum Vitamina C Glow' está viralizando na sua região.",
      type: "info",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      link: "/products",
    },
    {
      id: "3",
      title: "Sistema atualizado",
      description: "A versão 2.4 está no ar com novos recursos de inteligência artificial.",
      type: "sistema",
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot() {
    return this.notifications;
  }

  markAsRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.notify();
  }

  markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.notify();
  }

  dismiss(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const notificationsStore = new NotificationsStore();

export function useNotifications() {
  const [data, setData] = useState(() => notificationsStore.getSnapshot());

  useEffect(() => {
    return notificationsStore.subscribe(() => {
      setData(notificationsStore.getSnapshot());
    });
  }, []);

  const salesNotifications = data.filter((n) => n.type === "venda");

  return {
    notifications: salesNotifications,
    unreadCount: salesNotifications.filter((n) => !n.read).length,
    markAsRead: (id: string) => notificationsStore.markAsRead(id),
    markAllAsRead: () => {
      salesNotifications.forEach(n => notificationsStore.markAsRead(n.id));
    },
    dismiss: (id: string) => notificationsStore.dismiss(id),
  };
}

// --- UI COMPONENTS ---

function NotificationList({ closePanel }: { closePanel: () => void }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-text-1">Notificações</h2>
          {unreadCount > 0 && (
            <span className="grid place-items-center rounded-full bg-brand-500/20 px-2 py-0.5 text-xs font-medium text-brand-300">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence initial={false}>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="grid size-12 place-items-center rounded-full bg-surface-2 text-text-3 mb-3">
                <ShoppingBag className="size-5" />
              </div>
              <p className="text-sm font-medium text-text-1">Nenhuma venda por aqui ainda</p>
              <p className="text-xs text-text-3 mt-1">Tudo limpo no momento</p>
            </motion.div>
          ) : (
            notifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                className={cn(
                  "group relative flex items-start gap-3 rounded-[16px] border p-3 transition-colors",
                  n.read
                    ? "border-white/5 bg-surface-2/30 hover:bg-surface-2"
                    : "border-brand-500/20 bg-brand-500/10 hover:bg-brand-500/20"
                )}
              >
                {/* Unread indicator dot */}
                {!n.read && (
                  <span className="absolute -left-1 -top-1 size-2.5 rounded-full bg-brand-500 ring-2 ring-surface-1" />
                )}

                {/* Icon or Thumbnail */}
                {n.productImage ? (
                  <div className="relative size-12 shrink-0 rounded-lg overflow-hidden ring-1 ring-inset ring-white/10">
                    <img src={n.productImage} alt={n.productName || "Produto"} className="w-full h-full object-cover" loading="lazy" />
                    <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-success text-white shadow-sm ring-2 ring-surface-1">
                      <ShoppingBag className="size-2.5" />
                    </span>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full",
                      n.type === "venda"
                        ? "bg-success/20 text-success"
                        : n.type === "indicacao"
                          ? "bg-orange-500/20 text-orange-500"
                          : n.type === "sistema"
                            ? "bg-blue-500/20 text-blue-500"
                            : "bg-brand-500/20 text-brand-400"
                    )}
                  >
                    {n.type === "venda" ? (
                      <ShoppingBag className="size-5" />
                    ) : n.type === "indicacao" ? (
                      <Gift className="size-5" />
                    ) : n.type === "sistema" ? (
                      <Settings className="size-5" />
                    ) : (
                      <Info className="size-5" />
                    )}
                  </div>
                )}

                {/* Content */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    markAsRead(n.id);
                    if (n.link) {
                      closePanel();
                      navigate(n.link);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm line-clamp-1",
                        n.read ? "font-medium text-text-2" : "font-semibold text-text-1"
                      )}
                    >
                      {n.title}
                    </p>
                    <span className="shrink-0 text-[10px] font-medium text-text-3">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        locale: ptBR,
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-3 line-clamp-2 leading-relaxed">
                    {n.commission ? `Comissão de R$ ${n.commission.toFixed(2).replace('.', ',')}` : n.description}
                  </p>
                </div>

                {/* Dismiss X */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismiss(n.id);
                  }}
                  className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-black/40 text-text-3 opacity-0 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white group-hover:opacity-100 focus:opacity-100"
                  aria-label="Dispensar"
                >
                  <X className="size-3" />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-white/10 shrink-0 bg-surface-1/50 backdrop-blur-md">
        <button
          onClick={() => {
            closePanel();
            navigate("/dashboard"); // No notifications route explicitly, fallback
          }}
          className="w-full rounded-lg py-2 text-center text-xs font-medium text-text-3 hover:bg-white/5 hover:text-text-1 transition-colors"
        >
          Ver painel de atividades
        </button>
      </div>
    </div>
  );
}

export function NotificationsBell() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const bellButton = (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="relative grid size-9 place-items-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Notificações"
      aria-haspopup="dialog"
      aria-expanded={open}
    >
      <Bell className="size-4" />
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-2 top-2 size-2 rounded-full bg-brand-500 ring-2 ring-zinc-950"
        />
      )}
    </motion.button>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{bellButton}</SheetTrigger>
        <SheetContent
          side="bottom"
          className="p-0 border-t border-white/10 bg-surface-1/95 backdrop-blur-xl rounded-t-[24px]"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Notificações</SheetTitle>
          </SheetHeader>
          <NotificationList closePanel={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{bellButton}</PopoverTrigger>
      <PopoverContent
        align="end"
        alignOffset={-8}
        sideOffset={16}
        className="w-[380px] p-0 border border-white/10 bg-surface-1/95 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
      >
        <NotificationList closePanel={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
