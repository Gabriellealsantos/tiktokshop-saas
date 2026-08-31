import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, RefreshCw, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger, Button, Checkbox, Input, Label,
} from "@/components";
import { METRIC_PERIODS, type DashboardMetric, type DashboardResetResult } from "@/models/dashboard";
import {
  listMetrics,
  resetMetrics as resetMetricsApi,
  upsertMetric,
} from "@/services/dashboardAdminService";
import { cn } from "@/utils/utils";

// Campos lidos pelo getSummary. `int` marca os que o back guarda como Integer/Long — sem
// type="number" o browser não barra mais os centavos, então a validação passou para cá.
const FIELDS = [
  { key: "revenue", label: "GMV (R$)", int: false },
  { key: "orders", label: "Pedidos", int: true },
  { key: "commission", label: "Comissão estimada (R$)", int: false },
  { key: "avgTicket", label: "Ticket médio (R$)", int: false },
  { key: "itemsSold", label: "Itens vendidos", int: true },
  { key: "commissionBase", label: "Base de comissão (R$)", int: false },
  { key: "productViews", label: "Visualizações", int: true },
  { key: "productClicks", label: "Cliques", int: true },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];
type SlotForm = Record<FieldKey, string>;

const EMPTY_SLOT: SlotForm = {
  revenue: "", orders: "", commission: "", avgTicket: "",
  itemsSold: "", commissionBase: "", productViews: "", productClicks: "",
};

/**
 * Lê número em formato pt-BR. Com type="number" o browser devolvia "" ao ver a vírgula e o
 * dígito sumia sem erro; e Number("1.230,20") é NaN. Aqui o separador decimal é a ÚLTIMA
 * vírgula/ponto seguida de 1 ou 2 dígitos — o resto é separador de milhar e cai fora.
 * Assim "1.230,20", "1230,20" e "1230.20" viram 1230.2, e "1.230" vira 1230.
 */
const parseBRNumber = (raw: string): number => {
  const s = raw.trim().replace(/[^\d.,-]/g, "");
  if (s === "") return NaN;

  const sep = Math.max(s.lastIndexOf(","), s.lastIndexOf("."));
  const decimals = sep === -1 ? 0 : s.length - sep - 1;
  const isDecimalSep = sep > -1 && decimals >= 1 && decimals <= 2;

  const intPart = (isDecimalSep ? s.slice(0, sep) : s).replace(/[.,]/g, "");
  const fracPart = isDecimalSep ? s.slice(sep + 1) : "";
  return Number(fracPart ? `${intPart}.${fracPart}` : intPart);
};

const brFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

/** Reexibe o valor em pt-BR. Só no load e no blur: formatar a cada tecla faz o cursor pular. */
const toStr = (v: number | null | undefined) =>
  v === null || v === undefined ? "" : brFormatter.format(v);

const toNum = (v: string): number | null => (v.trim() === "" ? null : parseBRNumber(v));

// Vazio é válido (vira null). Reprova texto não-numérico, negativo e centavos em campo inteiro.
const fieldError = (v: string, isInt: boolean): string | null => {
  if (v.trim() === "") return null;
  const n = parseBRNumber(v);
  if (Number.isNaN(n)) return "Valor inválido";
  if (n < 0) return "Não pode ser negativo";
  if (isInt && !Number.isInteger(n)) return "Não aceita centavos";
  return null;
};

export function MetricsTab() {
  const [forms, setForms] = useState<Record<string, SlotForm>>({});
  const [loading, setLoading] = useState(true);
  const [savingRef, setSavingRef] = useState<string | null>(null);
  // Marca quais cards já tentaram salvar, para só então revelar os erros inline.
  const [attempted, setAttempted] = useState<Record<string, boolean>>({});

  // ── Estado do modal de reset ──────────────────────────────────────────
  const [resetOpen, setResetOpen] = useState(false);
  const [resetSelection, setResetSelection] = useState<Set<string>>(new Set());
  const [clearLiveSales, setClearLiveSales] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Inclui o "apagar todo o histórico": ele está dentro do mesmo modal, então "Selecionar
  // tudo" que deixasse ele de fora prometeria mais do que entrega.
  const allSelected = resetSelection.size === METRIC_PERIODS.length && clearLiveSales;

  const toggleResetPeriod = (ref: string) => {
    setResetSelection((prev) => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref); else next.add(ref);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setResetSelection(new Set());
      setClearLiveSales(false);
    } else {
      setResetSelection(new Set(METRIC_PERIODS.map((p) => p.periodRef)));
      setClearLiveSales(true);
    }
  };

  const handleResetConfirm = async () => {
    if (resetSelection.size === 0) return;
    setResetting(true);
    try {
      const res = await resetMetricsApi(Array.from(resetSelection), clearLiveSales);
      const { deleted = 0, liveSalesDeleted = 0, liveSalesPaused = false }: Partial<DashboardResetResult> =
        res.data ?? {};

      const partes = [`${deleted} métrica(s)`, `${liveSalesDeleted} venda(s) ao vivo`];
      if (liveSalesPaused) partes.push("geração automática pausada");
      const msg = `${partes.join(" · ")}.`;

      // Zero em tudo não é sucesso: sinaliza para uma falha silenciosa não passar batido.
      if (deleted === 0 && liveSalesDeleted === 0) toast.warning(`Nada a remover — ${msg}`);
      else toast.success(`Painel zerado — ${msg}`);
      setResetOpen(false);
      setResetSelection(new Set());
      setClearLiveSales(false);
      await load();
    } catch {
      toast.error("Falha ao resetar as métricas.");
    } finally {
      setResetting(false);
    }
  };

  // ── Carregamento ──────────────────────────────────────────────────────
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
            avgTicket: toStr(m.avgTicket), itemsSold: toStr(m.itemsSold),
            commissionBase: toStr(m.commissionBase),
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

  /** No blur o valor válido volta formatado em pt-BR, para o admin conferir os centavos. */
  const handleFieldBlur = (periodRef: string, key: FieldKey, value: string) => {
    if (value.trim() === "") return;
    const n = parseBRNumber(value);
    if (Number.isNaN(n)) return;
    handleField(periodRef, key, brFormatter.format(n));
  };

  const handleSave = async (period: (typeof METRIC_PERIODS)[number]) => {
    const f = forms[period.periodRef] ?? EMPTY_SLOT;

    // Bloqueia o save se algum campo do card estiver inválido e revela os erros.
    const hasError = FIELDS.some((field) => fieldError(f[field.key], field.int) !== null);
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
      avgTicket: toNum(f.avgTicket),
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
          O ticket médio informado é o valor inicial: o painel mostra o maior entre ele e o
          calculado (faturamento ÷ pedidos), então ele sobe com as vendas e nunca desce.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {/* ── Botão Resetar (abre modal) ──────────────────────────────── */}
          <AlertDialog open={resetOpen} onOpenChange={(open) => { setResetOpen(open); if (!open) { setResetSelection(new Set()); setClearLiveSales(false); } }}>
            <AlertDialogTrigger asChild>
              <Button
                variant="secondary"
                className="h-9 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
              >
                <RotateCcw className="size-3.5 mr-1.5" />
                Resetar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-950 border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Resetar métricas</AlertDialogTitle>
                <AlertDialogDescription>
                  Selecione os períodos que deseja zerar. Serão apagados os valores-base
                  <strong className="text-zinc-300"> e as vendas ao vivo dentro do período</strong> —
                  sem isso as janelas longas continuariam somando o histórico. A geração automática
                  de vendas é pausada; religue depois na aba "Vendas ao Vivo".
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-2 py-2">
                {/* Selecionar tudo */}
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <Checkbox
                    id="reset-all"
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                  <label htmlFor="reset-all" className="text-sm font-medium text-zinc-200 cursor-pointer">
                    Selecionar tudo
                  </label>
                </div>

                {METRIC_PERIODS.map((p) => (
                  <div key={p.periodRef} className="flex items-center gap-2 py-1 px-1 rounded-md hover:bg-white/5">
                    <Checkbox
                      id={`reset-${p.periodRef}`}
                      checked={resetSelection.has(p.periodRef)}
                      onCheckedChange={() => toggleResetPeriod(p.periodRef)}
                    />
                    <label htmlFor={`reset-${p.periodRef}`} className="text-sm text-zinc-300 cursor-pointer flex-1">
                      {p.label}
                      <span className="ml-2 text-[10px] font-mono text-zinc-500">{p.periodRef}</span>
                    </label>
                  </div>
                ))}

                {/* Vendas ao vivo */}
                <div className="flex items-center gap-2 pt-2 mt-1 border-t border-white/10">
                  <Checkbox
                    id="reset-live-sales"
                    checked={clearLiveSales}
                    onCheckedChange={(v) => setClearLiveSales(!!v)}
                  />
                  <label htmlFor="reset-live-sales" className="text-sm font-medium text-amber-400 cursor-pointer">
                    Apagar TODO o histórico de vendas ao vivo
                    <span className="ml-1 text-[10px] font-normal text-zinc-500">
                      (por padrão, só as vendas dentro dos períodos marcados são apagadas)
                    </span>
                  </label>
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 text-zinc-300 hover:bg-white/5">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => { e.preventDefault(); handleResetConfirm(); }}
                  disabled={resetSelection.size === 0 || resetting}
                  className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-40"
                >
                  {resetting && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
                  Resetar {resetSelection.size > 0 ? `(${resetSelection.size})` : ""}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="secondary" onClick={load} className="size-9 shrink-0 p-0 rounded-full" aria-label="Recarregar">
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {METRIC_PERIODS.map((period) => {
          const f = forms[period.periodRef] ?? EMPTY_SLOT;
          const busy = savingRef === period.periodRef;
          return (
            <div key={period.periodRef} className="glass-premium-purple relative overflow-hidden rounded-2xl border border-white/10 p-5 transition-all duration-200 hover:border-white/20 shadow-lg">
              <div className="relative z-10 flex items-center justify-between mb-4">
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

              <div className="relative z-10 grid grid-cols-2 gap-3">
                {FIELDS.map((field) => {
                  const error = attempted[period.periodRef] ? fieldError(f[field.key], field.int) : null;
                  return (
                    <div key={field.key} className="space-y-1.5">
                      <Label htmlFor={`${period.periodRef}-${field.key}`} className="text-xs text-zinc-400">
                        {field.label}
                      </Label>
                      <Input
                        id={`${period.periodRef}-${field.key}`}
                        // type="text" de propósito: com type="number" o browser descartava a
                        // vírgula e o valor sumia sem erro. O parse pt-BR fica em parseBRNumber.
                        type="text"
                        inputMode="decimal"
                        placeholder={field.int ? "0" : "0,00"}
                        value={f[field.key]}
                        onChange={(e) => handleField(period.periodRef, field.key, e.target.value)}
                        onBlur={(e) => handleFieldBlur(period.periodRef, field.key, e.target.value)}
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

