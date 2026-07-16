import { requestBackend } from "../utils/requests";
import type { LiveSalesConfigUpdate } from "@/models/live-sales";

// ── Live Sales Admin — chamadas HTTP ─────────────────────────────────────────

export const getLiveSalesConfig = () =>
  requestBackend({ method: "GET", url: "/api/admin/live-sales/config", withCredentials: true });

export const updateLiveSalesConfig = (config: LiveSalesConfigUpdate) =>
  requestBackend({ method: "PUT", url: "/api/admin/live-sales/config", data: config, withCredentials: true });

/** Dispara uma venda ao vivo na hora. Sem productId, o back sorteia um produto ativo. */
export const fireLiveSale = (productId?: number) =>
  requestBackend({
    method: "POST",
    url: "/api/admin/live-sales/fire",
    data: productId ? { productId } : {},
    withCredentials: true,
  });
