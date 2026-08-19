import { useState, useMemo } from "react";
import { Clock3 } from "lucide-react";

import { EmptyState, Pill, Page } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { useAuth } from "@/context/auth";
import { MetricsTab } from "./components/metrics-tab";
import { InsightsTab } from "./components/insights-tab";
import { LiveSalesTab } from "./components/live-sales-tab";
import { NotificationSoundTab } from "./components/notification-sound-tab";
import { CategoriesTab } from "./components/categories-tab";
import { ViralTab } from "./components/viral-tab";
import { VideoTemplatesTab } from "./components/video-templates-tab";
import { GalleryAvatarsTab } from "./components/gallery-avatars-tab";
import { LimitsTab } from "./components/limits-tab";
import { UsersTab } from "./components/users-tab";
import { SecurityTab } from "./components/security-tab";
import { StudioPromptTab } from "./components/studio-prompt-tab";

export default function AdminScreen() {
  const { isAdmin, isAfiliado } = useAuth();
  const [tab, setTab] = useState("Usuários");
  const [pendingCount, setPendingCount] = useState(0);

  const availableTabs = useMemo(() => {
    if (isAdmin) {
      return [
        "Usuários",
        "Categorias",
        "Trend Boost",
        "Modelos de Vídeo",
        "Avatares",
        "Prompt de Vídeo",
        "Limites",
        "Métricas",
        "Vendas ao Vivo",
        "Notificações",
        "Segurança",
      ];
    }
    if (isAfiliado) {
      return ["Usuários", "Métricas", "Vendas ao Vivo"];
    }
    return [];
  }, [isAdmin, isAfiliado]);

  if (!isAdmin && !isAfiliado) {
    return (
      <AppShell>
        <Page>
          <EmptyState
            title="Acesso Negado"
            description="Esta página é restrita a administradores e afiliados."
          />
        </Page>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Page className="max-w-[1200px]">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-8 entrance">
          <div>
            <h1 className="text-3xl font-extrabold tracking-[-.035em] text-white md:text-4xl">
              Painel {isAdmin ? "Admin" : "do Afiliado"}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Gerencie usuários e permissões
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-400">
              <Clock3 className="size-3.5" />
              {pendingCount} pendentes
            </span>
          </div>
        </div>

        <div className="-mt-2 -mx-1 mb-6">
          <div className="flex gap-2 overflow-x-auto py-3 px-4 scrollbar-hide entrance rounded-2xl glass-premium-purple border border-white/10 shadow-lg">
            {availableTabs.map((x) => (
              <Pill key={x} active={tab === x} onClick={() => setTab(x)}>
                {x}
              </Pill>
            ))}
          </div>
        </div>

        <div className="glass-premium-purple rounded-[24px] p-4 md:p-6 mb-5 border border-white/10 shadow-lg entrance relative z-10">
          {tab === "Usuários" && (
            <UsersTab
              pendingCount={pendingCount}
              onPendingCountChange={setPendingCount}
            />
          )}
          {tab === "Categorias" && <CategoriesTab />}
          {tab === "Trend Boost" && <ViralTab />}
          {tab === "Modelos de Vídeo" && <VideoTemplatesTab />}
          {tab === "Avatares" && <GalleryAvatarsTab />}
          {tab === "Prompt de Vídeo" && <StudioPromptTab />}
          {tab === "Limites" && <LimitsTab />}
          {tab === "Métricas" && <MetricsTab />}
          {tab === "Vendas ao Vivo" && <LiveSalesTab />}
          {tab === "Notificações" && <NotificationSoundTab />}
          {tab === "Segurança" && <SecurityTab />}
        </div>
      </Page>
    </AppShell>
  );
}
