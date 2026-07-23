import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Pill, SectionTitle, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components";

interface SalesChartProps {
  chartData: { day: string; vendas: number }[];
}

export function SalesChart({ chartData }: SalesChartProps) {
  const [chart, setChart] = useState("Área");

  return (
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
  );
}
