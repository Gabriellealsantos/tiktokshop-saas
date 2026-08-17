import { requestBackend } from "../utils/requests";
import type { DashboardMetric, DashboardInsight } from "@/models/dashboard";

// ── Métricas base do dashboard (Faturamento) ─────────────────────────────────

export const listMetrics = () =>
  requestBackend({ method: "GET", url: "/api/admin/dashboard/metrics", withCredentials: true });

/** Upsert por (periodType, periodRef): cria se não existir, atualiza se existir. */
export const upsertMetric = (metric: DashboardMetric) =>
  requestBackend({ method: "PUT", url: "/api/admin/dashboard/metrics", data: metric, withCredentials: true });

export const deleteMetric = (id: number) =>
  requestBackend({ method: "DELETE", url: `/api/admin/dashboard/metrics/${id}`, withCredentials: true });

export const resetMetrics = (periodRefs: string[], clearLiveSales = false) =>
  requestBackend({ method: "POST", url: "/api/admin/dashboard/metrics/reset", data: { periodRefs, clearLiveSales }, withCredentials: true });


// ── Insights / Tendências ────────────────────────────────────────────────────

export const listAllInsights = () =>
  requestBackend({ method: "GET", url: "/api/admin/dashboard/insights", withCredentials: true });

export const createInsight = (insight: DashboardInsight) =>
  requestBackend({ method: "POST", url: "/api/admin/dashboard/insights", data: insight, withCredentials: true });

export const updateInsight = (id: number, insight: DashboardInsight) =>
  requestBackend({ method: "PUT", url: `/api/admin/dashboard/insights/${id}`, data: insight, withCredentials: true });

export const deleteInsight = (id: number) =>
  requestBackend({ method: "DELETE", url: `/api/admin/dashboard/insights/${id}`, withCredentials: true });
