import type { UserPlan } from "./user";

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
