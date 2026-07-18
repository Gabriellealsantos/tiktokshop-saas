import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Banknote,
  ChartSpline,
  CircleDollarSign,
  PackageCheck,
  ReceiptText,
  Sparkles,
  TrendingUp,
  ShoppingCart,
  Wallet,
  Eye,
  MousePointerClick
} from "lucide-react";
import { MetricCard, Pill, Page, PageHeader, SectionTitle, ChartContainer, ChartTooltip, ChartTooltipContent, EmptyState } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { useAuth } from "@/context/auth";
import type { DashboardSummary, LiveSaleEventDTO, DashboardInsightDTO } from "@/models/dashboard";
import { getSummary, getLiveSalesFeed, getInsights } from "@/services/dashboardService";
import { subscribeTopic } from "@/utils/ws";
import { useDocumentTitle } from "@/utils/use-document-title";

import { LiveSales } from "./components/live-sales";
import { Trend } from "./components/trend-card";

// Rótulos das pills → códigos de período aceitos pelo back (getSummary).
const PERIOD_CODES: Record<string, string> = {
  Hoje: "today",
  "Esta semana": "week",
  "7 dias": "7d",
  "15 dias": "15d",
  "Este mês": "month",
  "30 dias": "30d",
};

// Ícones dos cards de tendência: a entidade não guarda ícone, então rotacionamos estes.
const TREND_ICONS = [TrendingUp, ChartSpline, Sparkles];

const brl = (n: number, digits = 0) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n ?? 0);
const int = (n: number) => new Intl.NumberFormat("pt-BR").format(n ?? 0);
const compact = (n: number) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(n ?? 0);

export function DashboardContent({ renderHeader }: { renderHeader?: React.ReactNode }) {
  const { isAdmin, user, roles } = useAuth();
  const isAfiliado = roles.includes("ROLE_AFFILIATE");
  const canSeeRevenue = isAdmin || isAfiliado;
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "";
  
  const [view, setView] = useState(canSeeRevenue ? "Faturamento" : "Tendências");
  const [chart, setChart] = useState("Área");
  const [selectedPeriod, setSelectedPeriod] = useState("7 dias");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [liveSales, setLiveSales] = useState<LiveSaleEventDTO[]>([]);
  const [insights, setInsights] = useState<DashboardInsightDTO[]>([]);

  const fetchSummary = useCallback(async () => {
    if (!canSeeRevenue) return;
    const code = PERIOD_CODES[selectedPeriod];
    if (!code) return;
    try {
      const res = await getSummary(code);
      setSummary(res.data as DashboardSummary);
    } catch {
      // silencioso — mantém o último snapshot
    }
  }, [canSeeRevenue, selectedPeriod]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Buscar feed inicial de vendas ao vivo
  useEffect(() => {
    if (!canSeeRevenue) return;
    getLiveSalesFeed().then(res => {
      setLiveSales(res.data.recent.slice(0, 4));
    }).catch(() => {});
  }, [canSeeRevenue]);

  // Tendências cadastradas pelo admin (já vêm filtradas por ativo do back).
  useEffect(() => {
    getInsights().then(res => {
      setInsights(res.data as DashboardInsightDTO[]);
    }).catch(() => {});
  }, []);

  // Ao vivo: cada venda estourada em /topic/live-sales refaz o fetch (debounce),
  // atualizando faturamento, ticket médio, views e cliques em tempo real.
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!canSeeRevenue) return;
    const dispose = subscribeTopic<LiveSaleEventDTO>("/topic/live-sales", (payload) => {
      setLiveSales(prev => [payload, ...prev].slice(0, 4));
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
      refetchTimer.current = setTimeout(() => fetchSummary(), 800);
    });
    return () => {
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
      dispose();
    };
  }, [canSeeRevenue, fetchSummary]);

  const chartData = useMemo(
    () => (summary?.series ?? []).map((p) => ({ day: p.label, vendas: p.revenue })),
    [summary],
  );

  const byOrder = (a: DashboardInsightDTO, b: DashboardInsightDTO) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
  const trendCards = useMemo(
    () => insights.filter((i) => i.kind === "CARD").sort(byOrder),
    [insights],
  );
  const momentRead = useMemo(
    () => insights.filter((i) => i.kind === "MOMENT_READ").sort(byOrder)[0] ?? null,
    [insights],
  );

  const periods = [
    "Hoje",
    "Esta semana",
    "7 dias",
    "15 dias",
    "Este mês",
    "30 dias",
    "Personalizado",
  ];
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
          {periods.map((period) => (
            <Pill
              key={period}
              active={selectedPeriod === period}
              onClick={() => PERIOD_CODES[period] && setSelectedPeriod(period)}
            >
              {period}
            </Pill>
          ))}
        </div>
        {view === "Faturamento" ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Faturamento total"
                value={summary ? brl(summary.revenue) : "—"}
                hint="Base + vendas ao vivo"
                tone="positive"
                icon={Banknote}
                surface="elevated"
                emphasis="primary"
              />
              <MetricCard
                label="Pedidos confirmados"
                value={summary ? int(summary.orders) : "—"}
                hint="No período"
                tone="neutral"
                icon={PackageCheck}
                surface="elevated"
              />
              <MetricCard
                label="Ganhos em comissão"
                value={summary ? brl(summary.commission) : "—"}
                hint="Sobre as vendas"
                tone="positive"
                icon={CircleDollarSign}
                surface="elevated"
              />
              <MetricCard
                label="Ticket médio"
                value={summary ? brl(summary.avgTicket, 2) : "—"}
                hint="Faturamento / pedidos"
                tone="positive"
                icon={ReceiptText}
                surface="elevated"
              />
              <MetricCard
                label="Itens Vendidos"
                value={summary ? int(summary.itemsSold) : "—"}
                hint="No período"
                tone="positive"
                icon={ShoppingCart}
                surface="elevated"
              />
              <MetricCard
                label="Base de Comissão"
                value={summary ? brl(summary.commissionBase) : "—"}
                hint="Consistente com o volume"
                tone="neutral"
                icon={Wallet}
                surface="elevated"
              />
              <MetricCard
                label="Visualizações do Produto"
                value={summary ? compact(summary.productViews) : "—"}
                hint="Em tempo real"
                tone="positive"
                icon={Eye}
                surface="elevated"
              />
              <MetricCard
                label="Cliques no Produto"
                value={summary ? compact(summary.productClicks) : "—"}
                hint="Em tempo real"
                tone="neutral"
                icon={MousePointerClick}
                surface="elevated"
              />
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
              <div className="relative overflow-hidden rounded-2xl p-5 bg-dash-surface backdrop-blur-2xl backdrop-saturate-150 border border-dash-border shadow-[0_8px_32px_-8px_oklch(0_0_0/0.5),inset_0_1px_0_0_oklch(1_0_0/0.10)] duration-200 before:absolute before:inset-0 before:pointer-events-none before:bg-dash-tint after:absolute after:inset-0 after:pointer-events-none after:bg-gradient-to-b after:from-white/[0.07] after:via-transparent after:to-transparent">
                <div className="relative z-10">
                  <SectionTitle
                    title="Evolução de Vendas"
                    description="Valores definidos no painel administrativo"
                    action={
                      <div className="flex gap-2">
                        <Pill active={chart === "Área"} onClick={() => setChart("Área")}>
                          Área
                        </Pill>
                        <Pill active={chart === "Barras"} onClick={() => setChart("Barras")}>
                          Barras
                        </Pill>
                      </div>
                    }
                  />
                  <ChartContainer
                    className="h-[310px] w-full"
                    config={{ vendas: { label: "Vendas", color: "var(--accent-500)" } }}
                  >
                    {chart === "Área" ? (
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="25%" stopColor="var(--color-dash-accent)" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="var(--color-dash-accent)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$ ${value / 1000}k`} />
                        <ChartTooltip 
                          cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
                          content={<ChartTooltipContent className="backdrop-blur-xl rounded-xl border border-dash-border bg-dash-surface shadow-xl" />} 
                        />
                        <Area
                          dataKey="vendas"
                          type="monotone"
                          stroke="var(--color-dash-accent)"
                          fill="url(#fillSales)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    ) : (
                      <BarChart data={chartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$ ${value / 1000}k`} />
                        <Bar dataKey="vendas" fill="var(--color-dash-accent)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    )}
                  </ChartContainer>
                </div>
              </div>
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
  const { isAdmin, roles } = useAuth();
  const isAfiliado = roles.includes("ROLE_AFFILIATE");

  return (
    <AppShell>
      <Page>
        <DashboardContent />
      </Page>
    </AppShell>
  );
}
