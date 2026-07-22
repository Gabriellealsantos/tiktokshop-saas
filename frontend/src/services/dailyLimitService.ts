import { requestBackend } from "@/utils/requests";
import type { DailyLimitForm } from "@/models/dailyLimit";

/** Lista os limites de todos os fluxos (AVATAR, VIRAL_MODEL, …). */
export const listDailyLimits = () =>
  requestBackend({
    method: "GET",
    url: "/api/admin/daily-limits",
    withCredentials: true,
  });

/** Atualiza o limite de um fluxo específico. */
export const updateDailyLimit = (flowType: string, form: DailyLimitForm) =>
  requestBackend({
    method: "PUT",
    url: `/api/admin/daily-limits/${flowType}`,
    data: form,
    withCredentials: true,
  });
