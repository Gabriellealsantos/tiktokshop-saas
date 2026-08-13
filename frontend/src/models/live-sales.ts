/** Espelha LiveSalesMode do back: DISABLED (parado), MANUAL (só disparo manual), AUTOMATIC (job por intervalo). */
export type LiveSalesMode = "DISABLED" | "MANUAL" | "AUTOMATIC";

export type LiveSalesSource = "RANDOM" | "CATEGORY" | "ADMIN_LIST" | "USER_FAVORITES";

export type LiveSalesConfig = {
  id?: number;
  mode: LiveSalesMode;
  sourceType: LiveSalesSource;
  categoryId: number | null;
  adminProductIds: number[] | null;
  intervalSeconds: number | null;
  randomInterval: boolean;
  intervalMinSeconds: number | null;
  intervalMaxSeconds: number | null;
  updatedAt?: string;
};

export type LiveSalesConfigUpdate = Pick<
  LiveSalesConfig,
  "mode" | "sourceType" | "categoryId" | "adminProductIds" | "intervalSeconds" | "randomInterval" | "intervalMinSeconds" | "intervalMaxSeconds"
>;
