import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Pill, SectionTitle, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components";

interface SalesChartProps {
  chartData: { day: string; vendas: number }[];
}

/**
 * Notação compacta em vez de dividir por mil na mão: com GMV na casa dos milhões o
 * formatador antigo imprimia "R$ 120000k". Aqui o Intl escolhe mil/mi/bi pela escala.
 */
const compactBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function SalesChart({ chartData }: SalesChartProps) {
  const [chart, setChart] = useState("Área");

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-[#1c1b26]/20 backdrop-blur-md border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.25),0_8px_20px_-10px_rgba(0,0,0,0.5)] duration-200">
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
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => compactBRL.format(value)} />
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
                // "Hoje" gera um ponto só, e uma Area sem dot não desenha nada com 1 elemento —
                // o gráfico ficava vazio na aba padrão.
                dot={{ r: 3, fill: "var(--color-dash-accent)", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => compactBRL.format(value)} />
              <Bar dataKey="vendas" fill="var(--color-dash-accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ChartContainer>
      </div>
    </div>
  );
}
