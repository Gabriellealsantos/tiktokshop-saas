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
