import { useState } from "react";
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
import { LimitsTab } from "./components/limits-tab";
import { UsersTab } from "./components/users-tab";
import { SecurityTab } from "./components/security-tab";
import { StudioPromptTab } from "./components/studio-prompt-tab";

export default function AdminScreen() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState("Usuários");
  const [pendingCount, setPendingCount] = useState(0);

  if (!isAdmin) {
    return (
      <AppShell>
        <Page>
          <EmptyState
            title="Acesso Negado"
            description="Esta página é restrita a administradores."
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
              Painel Admin
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

        <div className="-mt-2 -mx-1 mb-6 flex gap-2 overflow-x-auto py-2 px-1 scrollbar-hide entrance">
          {[
            "Usuários",
            "Categorias",
            "Trend Boost",
            "Modelos de Vídeo",
            "Prompt de Vídeo",
            "Limites",
            "Métricas",
            "Tendências",
            "Vendas ao Vivo",
            "Notificações",
            "Segurança",
          ].map((x) => (
            <Pill key={x} active={tab === x} onClick={() => setTab(x)}>
              {x}
            </Pill>
          ))}
        </div>

        {tab === "Usuários" && (
          <UsersTab
            pendingCount={pendingCount}
            onPendingCountChange={setPendingCount}
          />
        )}
        {tab === "Categorias" && <CategoriesTab />}
        {tab === "Trend Boost" && <ViralTab />}
        {tab === "Modelos de Vídeo" && <VideoTemplatesTab />}
        {tab === "Prompt de Vídeo" && <StudioPromptTab />}
        {tab === "Limites" && <LimitsTab />}
        {tab === "Métricas" && <MetricsTab />}
        {tab === "Tendências" && <InsightsTab />}
        {tab === "Vendas ao Vivo" && <LiveSalesTab />}
        {tab === "Notificações" && <NotificationSoundTab />}
        {tab === "Segurança" && <SecurityTab />}
      </Page>
    </AppShell>
  );
}
