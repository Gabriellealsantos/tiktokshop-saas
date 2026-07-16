import { requestBackend } from "../utils/requests";

// ── Dashboard do usuário — chamadas HTTP ─────────────────────────────────────

/** Resumo do dashboard (base cadastrada + vendas ao vivo). period: today|7d|15d|30d|week|month|custom. */
export const getSummary = (period?: string, from?: string, to?: string) =>
  requestBackend({
    method: "GET",
    url: "/api/dashboard",
    params: { period, from, to },
    withCredentials: true,
  });

/** Histórico recente de vendas ao vivo. */
export const getLiveSalesFeed = () =>
  requestBackend({
    method: "GET",
    url: "/api/live-sales",
    withCredentials: true,
  });

/** Tendências ativas exibidas no dashboard (cadastradas pelo admin). */
export const getInsights = () =>
  requestBackend({
    method: "GET",
    url: "/api/dashboard/insights",
    withCredentials: true,
  });
