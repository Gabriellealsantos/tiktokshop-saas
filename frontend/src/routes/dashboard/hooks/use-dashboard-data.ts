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

/** Teto de frequência do refetch que reconcilia o estado local com o servidor. */
const RECONCILE_MS = 10000;

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

  // Teto de frequência do refetch de reconciliação. É um THROTTLE, não um debounce: o
  // gerador dispara vendas a cada 1-9s, então reagendar a cada venda (como era antes)
  // adiava o fetch para sempre e o painel só mudava com refresh manual.
  const lastFetchAt = useRef(0);
  const pendingRefetch = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!canSeeRevenue) return;
    const code = PERIOD_CODES[selectedPeriod];
    if (!code) return;
    try {
      const res = await getSummary(code);
      lastFetchAt.current = Date.now();
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
    }).catch(() => { });
  }, [canSeeRevenue]);

  // Tendências cadastradas pelo admin (já vêm filtradas por ativo do back).
  useEffect(() => {
    getInsights().then(res => {
      setInsights(res.data as DashboardInsightDTO[]);
    }).catch(() => { });
  }, []);

  const scheduleReconcile = useCallback(() => {
    if (pendingRefetch.current) return; // já há um refetch a caminho
    const wait = Math.max(0, RECONCILE_MS - (Date.now() - lastFetchAt.current));
    pendingRefetch.current = setTimeout(() => {
      pendingRefetch.current = null;
      lastFetchAt.current = Date.now();
      fetchSummary();
    }, wait);
  }, [fetchSummary]);

  /**
   * Aplica a venda recebida direto no summary, sem esperar o servidor: é o que faz os cards
   * subirem no mesmo instante em que a notificação do produto cai. O refetch acima depois
   * reconcilia o que não dá para prever daqui (views e cliques, que o back sorteia por venda).
   */
  const applySale = useCallback((sale: LiveSaleEventDTO) => {
    setSummary((prev) => {
      if (!prev) return prev;
      const revenue = prev.revenue + sale.amount;
      const orders = prev.orders + 1;
      // max() espelha o piso do back (avgTicket cadastrado): não deixa o ticket cair.
      const avgTicket = Math.max(orders > 0 ? revenue / orders : 0, prev.avgTicket);

      // A venda entra no último ponto da série — o bucket da hora/dia corrente.
      const series = prev.series.length > 0
        ? prev.series.map((p, i) =>
          i === prev.series.length - 1
            ? { ...p, revenue: p.revenue + sale.amount, orders: p.orders + 1 }
            : p)
        : prev.series;

      return {
        ...prev,
        revenue,
        orders,
        avgTicket,
        commission: prev.commission + sale.commission,
        itemsSold: prev.itemsSold + 1,
        commissionBase: prev.commissionBase + sale.amount,
        series,
      };
    });
  }, []);

  // Ao vivo: cada venda estourada em /user/queue/live-sales entra na hora nos cards e no
  // gráfico, e agenda a reconciliação com o servidor.
  useEffect(() => {
    if (!canSeeRevenue) return;
    const dispose = subscribeTopic<LiveSaleEventDTO>("/user/queue/live-sales", (payload) => {
      if ((payload as LiveSaleEventDTO & { action?: string }).action === "PING") return;
      setLiveSales(prev => [payload, ...prev].slice(0, 4));
      applySale(payload);
      scheduleReconcile();
    });
    return () => {
      if (pendingRefetch.current) {
        clearTimeout(pendingRefetch.current);
        pendingRefetch.current = null;
      }
      dispose();
    };
  }, [canSeeRevenue, applySale, scheduleReconcile]);

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
