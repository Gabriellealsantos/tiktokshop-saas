import { useState } from "react";
import {
  ChartSpline,
  Sparkles,
  Calendar,
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

export function DashboardContent({ renderHeader }: { renderHeader?: React.ReactNode }) {
  const { isAdmin, user, roles } = useAuth();
  const isAfiliado = roles.includes("ROLE_AFFILIATE");
  const canSeeRevenue = isAdmin || isAfiliado;
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "";

  const [selectedPeriod, setSelectedPeriod] = useState("7 dias");

  const { summary, liveSales, chartData, trendCards, momentRead } = useDashboardData(canSeeRevenue, selectedPeriod);
  return (
    <div>
      <PageHeader
        title="Dashboard de Vendas"
        description="Acompanhe o desempenho de seus produtos e comissões em tempo real."
      />
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -my-2 px-1">
          {PERIODS.map((period) => (
            <Pill
              key={period}
              active={selectedPeriod === period}
              onClick={() => setSelectedPeriod(period)}
              className="px-4 py-2 text-sm shrink-0 whitespace-nowrap"
            >
              {period === "Personalizado" && <Calendar className="size-4" />}
              {period}
            </Pill>
          ))}
        </div>
        {renderHeader && (
          <div className="shrink-0">
            {renderHeader}
          </div>
        )}
      </div>
      <div style={{ zoom: 0.8 }}>
        <MetricsGrid summary={summary} />
        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
          <SalesChart chartData={chartData} />
          <LiveSales sales={liveSales} total={summary?.revenue ?? 0} />
        </div>
      </div>
    </div>
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
