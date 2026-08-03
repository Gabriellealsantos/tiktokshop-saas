import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button, Input, Label } from "@/components";
import { METRIC_PERIODS, type DashboardMetric } from "@/models/dashboard";
import {
  listMetrics,
  upsertMetric,
} from "@/services/dashboardAdminService";
import { cn } from "@/utils/utils";

// Campos efetivamente lidos pelo getSummary. avgTicket fica de fora: o back o recalcula.
const FIELDS = [
  { key: "revenue", label: "Faturamento (R$)", step: "0.01" },
  { key: "orders", label: "Pedidos", step: "1" },
  { key: "commission", label: "Comissão (R$)", step: "0.01" },
  { key: "itemsSold", label: "Itens vendidos", step: "1" },
  { key: "commissionBase", label: "Base de comissão (R$)", step: "0.01" },
  { key: "productViews", label: "Visualizações", step: "1" },
  { key: "productClicks", label: "Cliques", step: "1" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];
type SlotForm = Record<FieldKey, string>;

const EMPTY_SLOT: SlotForm = {
  revenue: "", orders: "", commission: "", itemsSold: "", commissionBase: "", productViews: "", productClicks: "",
};

const toStr = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));
const toNum = (v: string): number | null => (v.trim() === "" ? null : Number(v));

// Vazio é válido (vira null). Só reprova texto não-numérico ou valor negativo.
const fieldError = (v: string): string | null => {
  if (v.trim() === "") return null;
  const n = Number(v);
  if (Number.isNaN(n)) return "Valor inválido";
  if (n < 0) return "Não pode ser negativo";
  return null;
};

export function MetricsTab() {
  const [forms, setForms] = useState<Record<string, SlotForm>>({});
  const [loading, setLoading] = useState(true);
  const [savingRef, setSavingRef] = useState<string | null>(null);
  // Marca quais cards já tentaram salvar, para só então revelar os erros inline.
  const [attempted, setAttempted] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listMetrics();
      const metrics: DashboardMetric[] = res.data ?? [];
      const byRef = new Map(metrics.map((m) => [m.periodRef, m]));
      const next: Record<string, SlotForm> = {};
      for (const period of METRIC_PERIODS) {
        const m = byRef.get(period.periodRef);
        next[period.periodRef] = m
          ? {
            revenue: toStr(m.revenue), orders: toStr(m.orders), commission: toStr(m.commission),
            itemsSold: toStr(m.itemsSold), commissionBase: toStr(m.commissionBase),
            productViews: toStr(m.productViews), productClicks: toStr(m.productClicks),
          }
          : { ...EMPTY_SLOT };
      }
      setForms(next);
    } catch {
      toast.error("Falha ao carregar as métricas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleField = (periodRef: string, key: FieldKey, value: string) => {
    setForms((prev) => ({ ...prev, [periodRef]: { ...prev[periodRef], [key]: value } }));
  };

  const handleSave = async (period: (typeof METRIC_PERIODS)[number]) => {
    const f = forms[period.periodRef] ?? EMPTY_SLOT;

    // Bloqueia o save se algum campo do card estiver inválido e revela os erros.
    const hasError = FIELDS.some((field) => fieldError(f[field.key]) !== null);
    if (hasError) {
      setAttempted((prev) => ({ ...prev, [period.periodRef]: true }));
      return;
    }

    const metric: DashboardMetric = {
      periodType: period.periodType,
      periodRef: period.periodRef,
      revenue: toNum(f.revenue),
      orders: toNum(f.orders),
      commission: toNum(f.commission),
      avgTicket: null,
      itemsSold: toNum(f.itemsSold),
      commissionBase: toNum(f.commissionBase),
      productViews: toNum(f.productViews),
      productClicks: toNum(f.productClicks),
    };
    setSavingRef(period.periodRef);
    try {
      await upsertMetric(metric);
      toast.success(`Base de "${period.label}" salva.`);
    } catch {
      toast.error(`Falha ao salvar "${period.label}".`);
    } finally {
      setSavingRef(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
        <Loader2 className="size-4 animate-spin" /> Carregando métricas…
      </div>
    );
  }

  return (
    <div className="space-y-4 entrance">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-zinc-400 max-w-2xl">
          Valores-base por período. O dashboard soma estes números às vendas ao vivo em tempo real.
          O ticket médio é calculado automaticamente (faturamento ÷ pedidos).
        </p>
        <Button variant="secondary" onClick={load} className="size-9 shrink-0 p-0 rounded-full" aria-label="Recarregar">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {METRIC_PERIODS.map((period) => {
          const f = forms[period.periodRef] ?? EMPTY_SLOT;
          const busy = savingRef === period.periodRef;
          return (
            <div key={period.periodRef} className="rounded-[16px] border border-white/5 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white">{period.label}</h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    {period.periodType} · {period.periodRef}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 px-3 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20"
                  onClick={() => handleSave(period)}
                  disabled={busy}
                >
                  {busy ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Check className="size-3.5 mr-1.5" />}
                  Salvar
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {FIELDS.map((field) => {
                  const error = attempted[period.periodRef] ? fieldError(f[field.key]) : null;
                  return (
                    <div key={field.key} className="space-y-1.5">
                      <Label htmlFor={`${period.periodRef}-${field.key}`} className="text-xs text-zinc-400">
                        {field.label}
                      </Label>
                      <Input
                        id={`${period.periodRef}-${field.key}`}
                        type="number"
                        inputMode="decimal"
                        step={field.step}
                        min="0"
                        placeholder="0"
                        value={f[field.key]}
                        onChange={(e) => handleField(period.periodRef, field.key, e.target.value)}
                        aria-invalid={!!error}
                        className={cn(
                          "h-9 bg-black/40 border-white/10 text-sm",
                          error && "border-red-500/50 focus-visible:ring-red-500/20",
                        )}
                      />
                      {error && <p className="text-xs text-red-400">{error}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
