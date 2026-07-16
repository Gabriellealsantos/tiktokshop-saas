import { requestBackend } from "../utils/requests";

// ── Métricas base do dashboard (Faturamento) ─────────────────────────────────
export type DashboardPeriodType = "DAY" | "WEEK" | "MONTH" | "RANGE";

/** Espelha DashboardMetricDTO do back. avgTicket é derivado na leitura (revenue/orders), por isso não é editado aqui. */
export type DashboardMetric = {
  id?: number;
  periodType: DashboardPeriodType;
  periodRef: string;
  revenue: number | null;
  orders: number | null;
  commission: number | null;
  avgTicket?: number | null;
  itemsSold: number | null;
  commissionBase: number | null;
  productViews: number | null;
  productClicks: number | null;
  updatedAt?: string;
};

/**
 * Slots fixos do cadastro: cada par (periodType, periodRef) é EXATAMENTE a chave
 * que DashboardService.getSummary busca. Cadastrar fora desta lista gera métrica
 * que nunca aparece no dashboard — por isso a UX é presa a estes 6 períodos.
 */
export const METRIC_PERIODS: { label: string; periodRef: string; periodType: DashboardPeriodType }[] = [
  { label: "Hoje", periodRef: "today", periodType: "DAY" },
  { label: "Esta semana", periodRef: "week", periodType: "RANGE" },
  { label: "7 dias", periodRef: "7d", periodType: "RANGE" },
  { label: "15 dias", periodRef: "15d", periodType: "RANGE" },
  { label: "Este mês", periodRef: "month", periodType: "RANGE" },
  { label: "30 dias", periodRef: "30d", periodType: "RANGE" },
];

export const listMetrics = () =>
  requestBackend({ method: "GET", url: "/api/admin/dashboard/metrics", withCredentials: true });

/** Upsert por (periodType, periodRef): cria se não existir, atualiza se existir. */
export const upsertMetric = (metric: DashboardMetric) =>
  requestBackend({ method: "PUT", url: "/api/admin/dashboard/metrics", data: metric, withCredentials: true });

export const deleteMetric = (id: number) =>
  requestBackend({ method: "DELETE", url: `/api/admin/dashboard/metrics/${id}`, withCredentials: true });

// ── Insights / Tendências ────────────────────────────────────────────────────
/** CARD = os cards de topo; MOMENT_READ = o bloco "Leitura do momento". */
export type InsightKind = "CARD" | "MOMENT_READ";

/** Espelha DashboardInsightDTO do back. */
export type DashboardInsight = {
  id?: number;
  kind: InsightKind;
  title: string;
  content: string;
  orderIndex: number | null;
  active: boolean;
};

export const listAllInsights = () =>
  requestBackend({ method: "GET", url: "/api/admin/dashboard/insights", withCredentials: true });

export const createInsight = (insight: DashboardInsight) =>
  requestBackend({ method: "POST", url: "/api/admin/dashboard/insights", data: insight, withCredentials: true });

export const updateInsight = (id: number, insight: DashboardInsight) =>
  requestBackend({ method: "PUT", url: `/api/admin/dashboard/insights/${id}`, data: insight, withCredentials: true });

export const deleteInsight = (id: number) =>
  requestBackend({ method: "DELETE", url: `/api/admin/dashboard/insights/${id}`, withCredentials: true });
