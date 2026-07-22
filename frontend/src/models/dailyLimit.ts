export type FlowType = "AVATAR" | "VIRAL_MODEL";

/** Espelha DailyLimitDTO do backend. */
export interface DailyLimit {
  flowType: FlowType;
  maxPerDay: number;
  maxRegenerations: number;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

/** Campos editáveis (PUT /api/admin/daily-limits/{flowType}). */
export interface DailyLimitForm {
  maxPerDay: number;
  maxRegenerations: number;
}

/** Rótulos amigáveis por fluxo (o enum vem cru do backend). */
export const flowTypeLabels: Record<FlowType, string> = {
  AVATAR: "Avatar",
  VIRAL_MODEL: "Trend Boost (viral)",
};

/** Limites do DTO: maxPerDay 0–100, maxRegenerations 0–20. */
export const LIMIT_BOUNDS = {
  maxPerDay: { min: 0, max: 100 },
  maxRegenerations: { min: 0, max: 20 },
} as const;
