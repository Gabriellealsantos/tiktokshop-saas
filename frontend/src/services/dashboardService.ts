import { requestBackend } from "../utils/requests";

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

/** Resumo do dashboard (base cadastrada + vendas ao vivo). period: today|7d|15d|30d|week|month|custom. */
export const getSummary = (period?: string, from?: string, to?: string) =>
  requestBackend({
    method: "GET",
    url: "/api/dashboard",
    params: { period, from, to },
    withCredentials: true,
  });

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

/** Histórico recente de vendas ao vivo. */
export const getLiveSalesFeed = () =>
  requestBackend({
    method: "GET",
    url: "/api/live-sales",
    withCredentials: true,
  });

export type DashboardInsightDTO = {
  id: number;
  kind: "CARD" | "MOMENT_READ";
  title: string;
  content: string;
  orderIndex: number | null;
  active: boolean;
};

/** Tendências ativas exibidas no dashboard (cadastradas pelo admin). */
export const getInsights = () =>
  requestBackend({
    method: "GET",
    url: "/api/dashboard/insights",
    withCredentials: true,
  });
