export type FlowType = "AVATAR" | "VIRAL_MODEL" | "VIDEO_TEMPLATE" | "STUDIO";

/** Liberação de um papel inteiro dentro de um fluxo. Espelha RoleLimitOverrideDTO. */
export interface RoleLimitOverride {
  roleId: number;
  authority: string;
  unlimited: boolean;
}

/** Espelha DailyLimitDTO do backend. */
export interface DailyLimit {
  flowType: FlowType;
  maxPerDay: number;
  maxRegenerations: number;
  updatedAt?: string | null;
  updatedBy?: string | null;
  /** Uma linha por papel existente — inclusive os que estão sem liberação. */
  roleOverrides: RoleLimitOverride[];
}

/** Campos editáveis (PUT /api/admin/daily-limits/{flowType}). */
export interface DailyLimitForm {
  maxPerDay: number;
  maxRegenerations: number;
  roleOverrides: RoleLimitOverride[];
}

/** Exceção individual de um usuário em um fluxo. Espelha UserLimitOverrideDTO. */
export interface UserLimitOverride {
  flowType: FlowType;
  unlimited: boolean;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

/** Espelha UserLimitOverridesDTO (GET/PUT /api/admin/daily-limits/users/{id}). */
export interface UserLimitOverrides {
  userId: string;
  userName: string;
  flows: UserLimitOverride[];
}

/** Rótulos amigáveis por fluxo (o enum vem cru do backend). */
export const flowTypeLabels: Record<FlowType, string> = {
  AVATAR: "Avatar",
  VIRAL_MODEL: "Trend Boost (viral)",
  VIDEO_TEMPLATE: "Extrair movimento",
  STUDIO: "Studio",
};

/** Rótulos dos papéis — o backend manda a authority crua (ROLE_ADMIN, …). */
export const roleLabels: Record<string, string> = {
  ROLE_ADMIN: "ADM",
  ROLE_AFFILIATE: "Afiliado",
  ROLE_CLIENT: "Cliente",
};

export const roleLabel = (authority: string) =>
  roleLabels[authority] ?? authority.replace(/^ROLE_/, "");

/** Limites do DTO: maxPerDay 0–100, maxRegenerations 0–20. */
export const LIMIT_BOUNDS = {
  maxPerDay: { min: 0, max: 100 },
  maxRegenerations: { min: 0, max: 20 },
} as const;
