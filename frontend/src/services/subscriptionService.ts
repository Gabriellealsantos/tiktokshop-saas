import { requestBackend } from "../utils/requests";
import type { PlanType } from "@/models/subscription";

// ── Subscription — chamadas HTTP ─────────────────────────────────────────────

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
