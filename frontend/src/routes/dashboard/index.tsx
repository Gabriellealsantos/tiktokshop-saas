import { useState } from "react";
import {
  ChartSpline,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Pill, Page, PageHeader, SectionTitle, EmptyState } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { useAuth } from "@/context/auth";
import { useDocumentTitle } from "@/utils/use-document-title";

import { useDashboardData, PERIODS } from "./hooks/use-dashboard-data";
import { MetricsGrid } from "./components/metrics-grid";
import { SalesChart } from "./components/sales-chart";
import { LiveSales } from "./components/live-sales";
import { Trend } from "./components/trend-card";

// Ícones dos cards de tendência: a entidade não guarda ícone, então rotacionamos estes.
const TREND_ICONS = [TrendingUp, ChartSpline, Sparkles];

export function DashboardContent({ renderHeader }: { renderHeader?: React.ReactNode }) {
  const { isAdmin, user, roles } = useAuth();
  const isAfiliado = roles.includes("ROLE_AFFILIATE");
  const canSeeRevenue = isAdmin || isAfiliado;
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "";
  
  const [view, setView] = useState(canSeeRevenue ? "Faturamento" : "Tendências");
  const [selectedPeriod, setSelectedPeriod] = useState("7 dias");

  const { summary, liveSales, chartData, trendCards, momentRead } = useDashboardData(canSeeRevenue, selectedPeriod);

  return (
    <>
      {renderHeader}
      <PageHeader
          eyebrow="Painel principal"
          title={firstName ? `Olá, ${firstName}!` : "Olá!"}
          description="Sinais claros para decidir o que criar e escalar agora."
          actions={
            <div className="flex gap-2">
              {canSeeRevenue && (
                <Pill active={view === "Faturamento"} onClick={() => setView("Faturamento")}>
                  Faturamento
                </Pill>
              )}
              <Pill active={view === "Tendências"} onClick={() => setView("Tendências")}>
                Tendências
              </Pill>
            </div>
          }
        />
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {PERIODS.map((period) => (
            <Pill
              key={period}
              active={selectedPeriod === period}
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </Pill>
          ))}
        </div>
        {view === "Faturamento" ? (
          <>
            <MetricsGrid summary={summary} />
            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
              <SalesChart chartData={chartData} />
              <LiveSales sales={liveSales} total={summary?.revenue ?? 0} />
            </div>
          </>
        ) : trendCards.length === 0 && !momentRead ? (
          <EmptyState
            title="Sem tendências no momento"
            description="Assim que o admin publicar tendências, elas aparecem aqui."
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {trendCards.map((item, i) => (
              <Trend
                key={item.id}
                icon={TREND_ICONS[i % TREND_ICONS.length]}
                title={item.title}
                text={item.content}
              />
            ))}
            {momentRead && (
              <div className="glass-surface p-6 lg:col-span-3 overflow-hidden">
                <SectionTitle
                  title={momentRead.title}
                  description="Sinais combinados de catálogo e formatos"
                />
                <p className="max-w-4xl text-sm leading-7 text-text-2 wrap-break-word">
                  {momentRead.content}
                </p>
              </div>
            )}
          </div>
        )}
    </>
  );
}

export default function DashboardRoute() {
  useDocumentTitle("Painel Principal");

  return (
    <AppShell>
      <Page>
        <DashboardContent />
      </Page>
    </AppShell>
  );
}
