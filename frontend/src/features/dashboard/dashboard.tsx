import { useState, type ReactNode } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Banknote,
  ChartSpline,
  CircleDollarSign,
  PackageCheck,
  Radio,
  ReceiptText,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { MetricCard, Pill } from "@/components/base/primitives";
import { Page, PageHeader, SectionTitle } from "@/components/base/page";
import { AppShell } from "@/layouts/app-shell";
import { useMockSession } from "@/lib/mock-session";
import { dashboardSeries } from "@/mock/data";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function DashboardContent({ renderHeader }: { renderHeader?: ReactNode }) {
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
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Faturamento total"
              value="R$ 220.700"
              hint="+18,2% no período"
              tone="green"
              icon={Banknote}
            />
            <MetricCard
              label="Pedidos confirmados"
              value="1.491"
              hint="Taxa de aprovação 94%"
              icon={PackageCheck}
            />
            <MetricCard
              label="Ganhos em comissão"
              value="R$ 48.554"
              hint="22% sobre as vendas"
              tone="green"
              icon={CircleDollarSign}
            />
            <MetricCard
              label="Ticket médio"
              value="R$ 148,02"
              hint="+ R$ 12,40 vs. anterior"
              icon={ReceiptText}
            />
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
            <div className="glass-surface is-data p-5">
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
                        <stop offset="5%" stopColor="var(--accent-500)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--accent-500)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,.05)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      dataKey="vendas"
                      type="monotone"
                      stroke="var(--accent-400)"
                      fill="url(#fillSales)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={dashboardSeries}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,.05)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Bar dataKey="vendas" fill="var(--accent-500)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                )}
              </ChartContainer>
            </div>
            <div className="glass-surface is-data p-5">
              <Pill tone="live">
                <Radio className="size-3" />
                LIVE
              </Pill>
              <h3 className="mt-5 text-lg font-bold">Vendas ao Vivo</h3>
              <p className="mt-1 text-xs text-text-2">Atualização simulada em tempo real</p>
              <div className="my-8 text-4xl font-extrabold tabular-nums text-success">
                R$ 2.814,90
              </div>
              {["Sérum Glow", "Fone AirBeat", "Legging Sculpt"].map((name, i) => (
                <div
                  key={name}
                  className="flex justify-between border-t border-border py-3 text-xs"
                >
                  <span className="text-text-2">{name}</span>
                  <span className="text-success">+ R$ {String(34 + i * 21)},80</span>
                </div>
              ))}
            </div>
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

export function Dashboard() {
  return (
    <AppShell>
      <Page>
        <DashboardContent />
      </Page>
    </AppShell>
  );
}
function Trend({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof TrendingUp;
  title: string;
  text: string;
}) {
  return (
    <div className="glass-surface p-6">
      <Icon className="size-5 text-accent-300" />
      <h3 className="mt-5 font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-2">{text}</p>
    </div>
  );
}
