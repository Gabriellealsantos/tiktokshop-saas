import { requestBackend } from "../utils/requests";
import type { UserPlan } from "../models/user";

// Tipos de plano do back (PlanType.java).
export type PlanType = "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "ANNUAL" | "LIFETIME";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "BLOCKED";

export type SubscriptionResponse = {
  id: number;
  planType: PlanType;
  startedAt: string;
  expiresAt: string | null;
  status: SubscriptionStatus;
};

// ── Mapeamento plano front (rótulo PT-BR) ↔ PlanType do back ──────────────────
export const planToBackend: Record<Exclude<UserPlan, "sem_plano">, PlanType> = {
  mensal: "MONTHLY",
  trimestral: "QUARTERLY",
  semestral: "SEMIANNUAL",
  anual: "ANNUAL",
  vitalicio: "LIFETIME",
};

export const backendToPlan: Record<PlanType, UserPlan> = {
  MONTHLY: "mensal",
  QUARTERLY: "trimestral",
  SEMIANNUAL: "semestral",
  ANNUAL: "anual",
  LIFETIME: "vitalicio",
};

// ── Endpoints admin ───────────────────────────────────────────────────────────
export const listPlans = () =>
  requestBackend({ method: "GET", url: "/api/admin/plans", withCredentials: true });

export const getUserSubscription = (userId: string) =>
  requestBackend({
    method: "GET",
    url: `/api/admin/users/${userId}/subscription`,
    withCredentials: true,
  });

/** "Liberar": ativa a assinatura no plano escolhido e aprova o usuário (status ACTIVE). */
export const activateSubscription = (userId: string, planType: PlanType) =>
  requestBackend({
    method: "POST",
    url: `/api/admin/users/${userId}/subscription/activate`,
    data: { planType },
    withCredentials: true,
  });

/** "Bloquear": revoga o acesso (usuário LOCKED, assinatura BLOCKED). */
export const revokeSubscription = (userId: string) =>
  requestBackend({
    method: "POST",
    url: `/api/admin/users/${userId}/subscription/revoke`,
    withCredentials: true,
  });

export const cancelSubscription = (userId: string) =>
  requestBackend({
    method: "DELETE",
    url: `/api/admin/users/${userId}/subscription`,
    withCredentials: true,
  });
