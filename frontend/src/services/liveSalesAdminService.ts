import { requestBackend } from "../utils/requests";

/** Espelha LiveSalesMode do back: DISABLED (parado), MANUAL (só disparo manual), AUTOMATIC (job por intervalo). */
export type LiveSalesMode = "DISABLED" | "MANUAL" | "AUTOMATIC";

export type LiveSalesConfig = {
  id?: number;
  mode: LiveSalesMode;
  intervalSeconds: number | null;
  randomInterval: boolean;
  intervalMinSeconds: number | null;
  intervalMaxSeconds: number | null;
  updatedAt?: string;
};

export type LiveSalesConfigUpdate = Pick<
  LiveSalesConfig,
  "mode" | "intervalSeconds" | "randomInterval" | "intervalMinSeconds" | "intervalMaxSeconds"
>;

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
