import { useState, useEffect, useCallback, useRef, useMemo } from "react";

import type { DashboardSummary, LiveSaleEventDTO, DashboardInsightDTO } from "@/models/dashboard";
import { getSummary, getLiveSalesFeed, getInsights } from "@/services/dashboardService";
import { subscribeTopic } from "@/utils/ws";

// Rótulos das pills → códigos de período aceitos pelo back (getSummary).
const PERIOD_CODES: Record<string, string> = {
  Hoje: "today",
  "Esta semana": "week",
  "7 dias": "7d",
  "15 dias": "15d",
  "Este mês": "month",
  "30 dias": "30d",
};

export const PERIODS = [
  "Hoje",
  "Esta semana",
  "7 dias",
  "15 dias",
  "Este mês",
  "30 dias",
];

export function useDashboardData(canSeeRevenue: boolean, selectedPeriod: string) {
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

  return { summary, liveSales, chartData, trendCards, momentRead };
}
