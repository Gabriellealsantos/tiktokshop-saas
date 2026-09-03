import { requestBackend } from "@/utils/requests";
import type { DailyLimitForm, UserLimitOverride } from "@/models/dailyLimit";

/** Lista os limites de todos os fluxos (AVATAR, VIRAL_MODEL, …). */
export const listDailyLimits = () =>
  requestBackend({
    method: "GET",
    url: "/api/admin/daily-limits",
    withCredentials: true,
  });

/** Atualiza o limite de um fluxo específico (números + liberação por papel). */
export const updateDailyLimit = (flowType: string, form: DailyLimitForm) =>
  requestBackend({
    method: "PUT",
    url: `/api/admin/daily-limits/${flowType}`,
    data: form,
    withCredentials: true,
  });

/** Liberações individuais de um usuário — uma linha por fluxo. */
export const getUserLimitOverrides = (userId: string) =>
  requestBackend({
    method: "GET",
    url: `/api/admin/daily-limits/users/${userId}`,
    withCredentials: true,
  });

/** Substitui o conjunto de liberações do usuário (a lista chega completa). */
export const updateUserLimitOverrides = (userId: string, flows: UserLimitOverride[]) =>
  requestBackend({
    method: "PUT",
    url: `/api/admin/daily-limits/users/${userId}`,
    data: { flows },
    withCredentials: true,
  });
