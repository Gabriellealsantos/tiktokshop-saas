// ── Métricas base do dashboard (Admin) ────────────────────────────────────────
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

// ── Insights / Tendências (Admin) ────────────────────────────────────────────
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

// ── Dashboard do usuário ─────────────────────────────────────────────────────
export type DashboardSeriesPoint = {
  label: string;
  revenue: number;
  orders: number;
};

export type DashboardSummary = {
  revenue: number;
  orders: number;
  commission: number;
  avgTicket: number;
  itemsSold: number;
  commissionBase: number;
  productViews: number;
  productClicks: number;
  series: DashboardSeriesPoint[];
};

export type LiveSaleEventDTO = {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  amount: number;
  commission: number;
  createdAt: string;
};

export type LiveSalesFeedDTO = {
  totalToday: number;
  countToday: number;
  recent: LiveSaleEventDTO[];
};

export type DashboardInsightDTO = {
  id: number;
  kind: "CARD" | "MOMENT_READ";
  title: string;
  content: string;
  orderIndex: number | null;
  active: boolean;
};
