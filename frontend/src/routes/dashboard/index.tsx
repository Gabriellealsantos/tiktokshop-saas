import { useState } from "react";
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
import { MetricCard, Pill, Page, PageHeader, SectionTitle, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { useMockSession } from "@/context/mock-session";
import { dashboardSeries, dashboardKPIs } from "@/services/data";
import { useDocumentTitle } from "@/utils/use-document-title";

import { LiveSales } from "./components/live-sales";
import { Trend } from "./components/trend-card";

export function DashboardContent({ renderHeader }: { renderHeader?: React.ReactNode }) {
  const { role } = useMockSession();
  const [view, setView] = useState(role === "admin" ? "Faturamento" : "Tendências");
  const [chart, setChart] = useState("Área");
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
          title="Olá, Allan!"
          description="Sinais claros para decidir o que criar e escalar agora."
          actions={
            <div className="flex gap-2">
              {role === "admin" && (
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
          {periods.map((period, i) => (
            <Pill key={period} active={i === 2}>
              {period}
            </Pill>
          ))}
        </div>
        {view === "Faturamento" ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Faturamento total"
                value="R$ 220.700"
                hint="+18,2% no período"
                tone="positive"
                icon={Banknote}
                surface="elevated"
                emphasis="primary"
              />
              <MetricCard
                label="Pedidos confirmados"
                value="1.491"
                hint="Taxa de aprovação 94%"
                tone="neutral"
                icon={PackageCheck}
                surface="elevated"
              />
              <MetricCard
                label="Ganhos em comissão"
                value="R$ 48.554"
                hint="22% sobre as vendas"
                tone="positive"
                icon={CircleDollarSign}
                surface="elevated"
              />
              <MetricCard
                label="Ticket médio"
                value="R$ 148,02"
                hint="+ R$ 12,40 vs. anterior"
                tone="positive"
                icon={ReceiptText}
                surface="elevated"
              />
              <MetricCard
                label="Itens Vendidos"
                value={dashboardKPIs.itensVendidos}
                hint="+5,4% na semana"
                tone="positive"
                icon={ShoppingCart}
                surface="elevated"
              />
              <MetricCard
                label="Base de Comissão"
                value={dashboardKPIs.baseComissao}
                hint="Consistente com o volume"
                tone="neutral"
                icon={Wallet}
                surface="elevated"
              />
              <MetricCard
                label="Visualizações do Produto"
                value={dashboardKPIs.visualizacoesProduto}
                hint="+12% hoje"
                tone="positive"
                icon={Eye}
                surface="elevated"
              />
              <MetricCard
                label="Cliques no Produto"
                value={dashboardKPIs.cliquesProduto}
                hint="-2,1% hoje"
                tone="negative"
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
                      <AreaChart data={dashboardSeries}>
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
                      <BarChart data={dashboardSeries}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$ ${value / 1000}k`} />
                        <Bar dataKey="vendas" fill="var(--color-dash-accent)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    )}
                  </ChartContainer>
                </div>
              </div>
              <LiveSales />
            </div>
          </>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            <Trend
              icon={TrendingUp}
              title="Beleza prática em alta"
              text="Produtos com demonstração visual cresceram 31% nas últimas 48h."
            />
            <Trend
              icon={ChartSpline}
              title="Hooks de comparação"
              text="Vídeos antes/depois sustentam retenção 22% acima da média."
            />
            <Trend
              icon={Sparkles}
              title="Janela emergente"
              text="Casa inteligente ganha tração entre 18h e 22h."
            />
            <div className="glass-surface p-6 lg:col-span-3">
              <SectionTitle
                title="Leitura do momento"
                description="Sinais combinados de catálogo e formatos"
              />
              <p className="max-w-4xl text-sm leading-7 text-text-2">
                A oportunidade mais forte está em produtos que entregam transformação visível em até
                oito segundos. Priorize creators com energia natural, enquadramento próximo e uma
                prova concreta antes do CTA.
              </p>
            </div>
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
