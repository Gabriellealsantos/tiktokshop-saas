import { useCallback, useEffect, useState } from "react";
import { Infinity as InfinityIcon, Loader2, RefreshCw, Save, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button, Input, Label, Switch } from "@/components";
import { errMessage } from "@/routes/admin/components/viral-tab/components/image-upload";
import { listDailyLimits, updateDailyLimit } from "@/services/dailyLimitService";
import {
  LIMIT_BOUNDS,
  flowTypeLabels,
  roleLabel,
  type DailyLimit,
  type FlowType,
} from "@/models/dailyLimit";
import { cn } from "@/utils/utils";

// Draft guarda string pra permitir campo vazio enquanto edita; converte no save.
// `roles` mapeia roleId -> ilimitado, espelhando os toggles por papel do card.
type Draft = {
  maxPerDay: string;
  maxRegenerations: string;
  roles: Record<number, boolean>;
};

const labelFor = (flow: FlowType) => flowTypeLabels[flow] ?? flow;

/** Máscara de inteiro: só dígitos, sem zero à esquerda, teto = max. "" é permitido. */
const maskInt = (raw: string, max: number) => {
  if (raw === "-1") return "-1";
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return "";
  return String(Math.min(Number(digits), max));
};

const draftFrom = (item: DailyLimit): Draft => ({
  maxPerDay: String(item.maxPerDay),
  maxRegenerations: String(item.maxRegenerations),
  roles: Object.fromEntries((item.roleOverrides ?? []).map((r) => [r.roleId, r.unlimited])),
});

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
      setDrafts(Object.fromEntries(list.map((i) => [i.flowType, draftFrom(i)])));
    } catch {
      toast.error("Falha ao carregar os limites.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (
    flow: string,
    field: "maxPerDay" | "maxRegenerations",
    e: React.ChangeEvent<HTMLInputElement>,
    max: number,
  ) => {
    const masked = maskInt(e.target.value, max);
    if (e.target.value !== masked && masked !== "-1") e.target.value = masked;
    setDrafts((prev) => ({ ...prev, [flow]: { ...prev[flow], [field]: masked } }));
  };

  const toggleUnlimited = (flow: string, field: "maxPerDay" | "maxRegenerations") => {
    setDrafts((prev) => {
      const current = prev[flow][field];
      return { ...prev, [flow]: { ...prev[flow], [field]: current === "-1" ? "0" : "-1" } };
    });
  };

  const toggleRole = (flow: string, roleId: number) => {
    setDrafts((prev) => ({
      ...prev,
      [flow]: { ...prev[flow], roles: { ...prev[flow].roles, [roleId]: !prev[flow].roles[roleId] } },
    }));
  };

  const isDirty = (item: DailyLimit) => {
    const d = drafts[item.flowType];
    if (!d || d.maxPerDay === "" || d.maxRegenerations === "") return false;
    if (Number(d.maxPerDay) !== item.maxPerDay) return true;
    if (Number(d.maxRegenerations) !== item.maxRegenerations) return true;
    return (item.roleOverrides ?? []).some((r) => d.roles[r.roleId] !== r.unlimited);
  };

  const handleSave = async (item: DailyLimit) => {
    const d = drafts[item.flowType];
    if (!d || d.maxPerDay === "" || d.maxRegenerations === "") return;
    setSavingType(item.flowType);
    try {
      await updateDailyLimit(item.flowType, {
        maxPerDay: Number(d.maxPerDay),
        maxRegenerations: Number(d.maxRegenerations),
        roleOverrides: (item.roleOverrides ?? []).map((r) => ({
          ...r,
          unlimited: Boolean(d.roles[r.roleId]),
        })),
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
          pode regerar a mesma geração. Os números valem para todo mundo — marque um papel em
          "Ilimitado para" para liberar aquele grupo, ou libere um usuário específico pelo botão
          "Limites" no card dele, na aba Usuários.
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
            const d = drafts[item.flowType] ?? draftFrom(item);
            const saving = savingType === item.flowType;
            return (
              <div key={item.flowType} className="glass-premium-purple relative overflow-hidden flex flex-col gap-4 rounded-2xl border border-white/10 p-4 transition-all duration-200 hover:border-white/20 shadow-lg">
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

                {/* Liberação por papel: quem estiver marcado ignora os números acima. */}
                {(item.roleOverrides ?? []).length > 0 && (
                  <div className="relative z-10 space-y-2 rounded-xl border border-white/5 bg-black/20 p-3">
                    <div className="flex items-center gap-1.5">
                      <InfinityIcon className="size-3.5 text-brand-400" />
                      <Label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                        Ilimitado para
                      </Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.roleOverrides.map((role) => {
                        const on = Boolean(d.roles[role.roleId]);
                        return (
                          <button
                            key={role.roleId}
                            type="button"
                            onClick={() => toggleRole(item.flowType, role.roleId)}
                            aria-pressed={on}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all duration-150",
                              on
                                ? "bg-brand-500/20 text-brand-300 border-brand-500/40"
                                : "bg-white/5 text-zinc-500 border-white/10 hover:text-zinc-300 hover:border-white/20",
                            )}
                          >
                            {roleLabel(role.authority)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

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
