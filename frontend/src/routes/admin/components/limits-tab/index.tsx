import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Save, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button, Input, Label, Switch } from "@/components";
import { errMessage } from "@/routes/admin/components/viral-tab/components/image-upload";
import { listDailyLimits, updateDailyLimit } from "@/services/dailyLimitService";
import {
  LIMIT_BOUNDS,
  flowTypeLabels,
  type DailyLimit,
  type FlowType,
} from "@/models/dailyLimit";

// Draft guarda string pra permitir campo vazio enquanto edita; converte no save.
type Draft = { maxPerDay: string; maxRegenerations: string };

const labelFor = (flow: FlowType) => flowTypeLabels[flow] ?? flow;

/** Máscara de inteiro: só dígitos, sem zero à esquerda, teto = max. "" é permitido. */
const maskInt = (raw: string, max: number) => {
  if (raw === "-1") return "-1";
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return "";
  return String(Math.min(Number(digits), max));
};

export function LimitsTab() {
  const [items, setItems] = useState<DailyLimit[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listDailyLimits();
      const list = (res.data ?? []) as DailyLimit[];
      // Sort alphabetically so cards don't shuffle when updated (PostgreSQL might return in different order)
      list.sort((a, b) => a.flowType.localeCompare(b.flowType));
      setItems(list);
      setDrafts(
        Object.fromEntries(
          list.map((i) => [i.flowType, { maxPerDay: String(i.maxPerDay), maxRegenerations: String(i.maxRegenerations) }]),
        ),
      );
    } catch {
      toast.error("Falha ao carregar os limites.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (
    flow: string,
    field: keyof Draft,
    e: React.ChangeEvent<HTMLInputElement>,
    max: number,
  ) => {
    const masked = maskInt(e.target.value, max);
    if (e.target.value !== masked && masked !== "-1") e.target.value = masked;
    setDrafts((prev) => ({ ...prev, [flow]: { ...prev[flow], [field]: masked } }));
  };

  const toggleUnlimited = (flow: string, field: keyof Draft) => {
    setDrafts((prev) => {
      const current = prev[flow][field];
      return { ...prev, [flow]: { ...prev[flow], [field]: current === "-1" ? "0" : "-1" } };
    });
  };

  const isDirty = (item: DailyLimit) => {
    const d = drafts[item.flowType];
    if (!d || d.maxPerDay === "" || d.maxRegenerations === "") return false;
    return Number(d.maxPerDay) !== item.maxPerDay || Number(d.maxRegenerations) !== item.maxRegenerations;
  };

  const handleSave = async (item: DailyLimit) => {
    const d = drafts[item.flowType];
    if (!d || d.maxPerDay === "" || d.maxRegenerations === "") return;
    setSavingType(item.flowType);
    try {
      await updateDailyLimit(item.flowType, {
        maxPerDay: Number(d.maxPerDay),
        maxRegenerations: Number(d.maxRegenerations),
      });
      toast.success(`Limite de ${labelFor(item.flowType)} atualizado.`);
      await load();
    } catch (e) {
      toast.error(errMessage(e, "Falha ao salvar o limite."));
    } finally {
      setSavingType(null);
    }
  };

  return (
    <div className="space-y-4 entrance">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-400 max-w-2xl">
          Quantas gerações cada usuário pode fazer por dia, por fluxo. O limite reseta à meia-noite
          (fuso de São Paulo) e cada fluxo conta separado. "Correções/dia" é quantas vezes o usuário
          pode regerar a mesma geração.
        </p>
        <Button variant="secondary" onClick={load} className="size-9 p-0 rounded-full shrink-0" aria-label="Recarregar">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
          <Loader2 className="size-4 animate-spin" /> Carregando limites…
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-sm">Nenhum limite configurado.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const d = drafts[item.flowType] ?? { maxPerDay: String(item.maxPerDay), maxRegenerations: String(item.maxRegenerations) };
            const saving = savingType === item.flowType;
            return (
              <div key={item.flowType} className="relative overflow-hidden flex flex-col gap-4 rounded-2xl border border-dash-border bg-dash-surface backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_32px_-8px_oklch(0_0_0/0.5),inset_0_1px_0_0_oklch(1_0_0/0.10)] p-4 transition-all duration-200 hover:bg-dash-surface-hover hover:border-dash-border-hover before:absolute before:inset-0 before:pointer-events-none before:bg-dash-tint after:absolute after:inset-0 after:pointer-events-none after:bg-linear-to-b after:from-white/[0.07] after:via-transparent after:to-transparent">
                <div className="relative z-10 flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-brand-500/10 text-brand-400 shrink-0">
                    <Zap className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{labelFor(item.flowType)}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{item.flowType}</p>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-zinc-400">Gerações/dia</Label>
                      <div className="flex items-center gap-1.5">
                        <Label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 cursor-pointer" onClick={() => toggleUnlimited(item.flowType, "maxPerDay")}>Ilimitado</Label>
                        <Switch checked={d.maxPerDay === "-1"} onCheckedChange={() => toggleUnlimited(item.flowType, "maxPerDay")} className="scale-75 origin-right" />
                      </div>
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={d.maxPerDay === "-1" ? "∞" : d.maxPerDay}
                      onChange={(e) => handleChange(item.flowType, "maxPerDay", e, LIMIT_BOUNDS.maxPerDay.max)}
                      disabled={d.maxPerDay === "-1"}
                      placeholder="0"
                      className="h-9 bg-black/40 border-white/10 text-sm tabular-nums disabled:opacity-50 disabled:text-brand-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-zinc-400">Correções/dia</Label>
                      <div className="flex items-center gap-1.5">
                        <Label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 cursor-pointer" onClick={() => toggleUnlimited(item.flowType, "maxRegenerations")}>Ilimitado</Label>
                        <Switch checked={d.maxRegenerations === "-1"} onCheckedChange={() => toggleUnlimited(item.flowType, "maxRegenerations")} className="scale-75 origin-right" />
                      </div>
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={d.maxRegenerations === "-1" ? "∞" : d.maxRegenerations}
                      onChange={(e) => handleChange(item.flowType, "maxRegenerations", e, LIMIT_BOUNDS.maxRegenerations.max)}
                      disabled={d.maxRegenerations === "-1"}
                      placeholder="0"
                      className="h-9 bg-black/40 border-white/10 text-sm tabular-nums disabled:opacity-50 disabled:text-brand-400"
                    />
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-zinc-500 truncate">
                    {item.updatedBy ? `por ${item.updatedBy}` : "padrão do sistema"}
                  </span>
                  <Button size="sm" onClick={() => handleSave(item)} disabled={saving || !isDirty(item)} className="h-9 shrink-0">
                    {saving ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />}
                    Salvar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
