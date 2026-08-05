import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import {
  Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch,
} from "@/components";
import type { LiveSalesConfig, LiveSalesMode } from "@/models/live-sales";
import {
  fireLiveSale, getLiveSalesConfig, updateLiveSalesConfig,
} from "@/services/liveSalesAdminService";

const MODE_HINT: Record<LiveSalesMode, string> = {
  DISABLED: "Desligado — nenhuma venda ao vivo é disparada.",
  MANUAL: "Manual — só dispara pelo botão abaixo.",
  AUTOMATIC: "Automático — dispara uma venda sozinho no intervalo definido.",
};

export function LiveSalesTab() {
  const [mode, setMode] = useState<LiveSalesMode>("DISABLED");
  const [interval, setInterval] = useState<string>("");
  const [random, setRandom] = useState(false);
  const [minInterval, setMinInterval] = useState<string>("");
  const [maxInterval, setMaxInterval] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firing, setFiring] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLiveSalesConfig();
      const config: LiveSalesConfig = res.data;
      setMode(config.mode ?? "DISABLED");
      setInterval(config.intervalSeconds != null ? String(config.intervalSeconds) : "");
      setRandom(config.randomInterval ?? false);
      setMinInterval(config.intervalMinSeconds != null ? String(config.intervalMinSeconds) : "");
      setMaxInterval(config.intervalMaxSeconds != null ? String(config.intervalMaxSeconds) : "");
    } catch {
      toast.error("Falha ao carregar a configuração.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (mode === "AUTOMATIC") {
      if (random) {
        const min = Number(minInterval);
        const max = Number(maxInterval);
        if (!min || !max || min <= 0 || max < min) {
          toast.error("Faixa inválida: defina mín e máx (segundos) com máx ≥ mín.");
          return;
        }
      } else if (interval.trim() === "" || Number(interval) <= 0) {
        toast.error("Defina um intervalo em segundos maior que zero.");
        return;
      }
    }
    setSaving(true);
    try {
      await updateLiveSalesConfig({
        mode,
        intervalSeconds: interval.trim() === "" ? null : Number(interval),
        randomInterval: random,
        intervalMinSeconds: minInterval.trim() === "" ? null : Number(minInterval),
        intervalMaxSeconds: maxInterval.trim() === "" ? null : Number(maxInterval),
      });
      toast.success("Configuração salva.");
    } catch {
      toast.error("Falha ao salvar a configuração.");
    } finally {
      setSaving(false);
    }
  };

  const handleFire = async () => {
    setFiring(true);
    try {
      await fireLiveSale();
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { message?: string })?.message
        : undefined;
      toast.error(msg ?? "Falha ao disparar. Verifique se há produtos cadastrados no banco.");
    } finally {
      setFiring(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
        <Loader2 className="size-4 animate-spin" /> Carregando configuração…
      </div>
    );
  }

  const showInterval = mode === "AUTOMATIC";

  return (
    <div className="space-y-4 entrance">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-400 max-w-2xl">
          Controla o motor de "Vendas ao Vivo" — os pop-ups e o incremento em tempo real do dashboard.
          Cada disparo sorteia um produto real cadastrado no banco.
        </p>
        <Button variant="secondary" onClick={load} className="size-9 shrink-0 p-0 rounded-full" aria-label="Recarregar">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-dash-border bg-dash-surface backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_32px_-8px_oklch(0_0_0/0.5),inset_0_1px_0_0_oklch(1_0_0/0.10)] p-5 max-w-2xl duration-200 before:absolute before:inset-0 before:pointer-events-none before:bg-dash-tint after:absolute after:inset-0 after:pointer-events-none after:bg-linear-to-b after:from-white/[0.07] after:via-transparent after:to-transparent">
        <div className="relative z-10 space-y-5">
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-400">Modo de disparo</Label>
          <Select value={mode} onValueChange={(v: LiveSalesMode) => setMode(v)}>
            <SelectTrigger className="h-9 bg-black/40 border-white/10 text-sm max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300">
              <SelectItem value="DISABLED">Desligado</SelectItem>
              <SelectItem value="MANUAL">Manual</SelectItem>
              <SelectItem value="AUTOMATIC">Automático</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-zinc-500">{MODE_HINT[mode]}</p>
        </div>

        {showInterval && (
          <div className="space-y-4 rounded-[12px] border border-white/5 bg-black/20 p-4">
            <div className="flex items-center gap-3">
              <Switch checked={random} onCheckedChange={setRandom} />
              <Label className="text-sm text-zinc-300">
                Intervalo aleatório {random ? "(sorteia dentro da faixa)" : "(intervalo fixo)"}
              </Label>
            </div>

            {random ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="min" className="text-xs text-zinc-400">Mínimo (segundos)</Label>
                  <Input
                    id="min" type="number" min="1" placeholder="ex.: 20"
                    value={minInterval} onChange={(e) => setMinInterval(e.target.value)}
                    className="h-9 bg-black/40 border-white/10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="max" className="text-xs text-zinc-400">Máximo (segundos)</Label>
                  <Input
                    id="max" type="number" min="1" placeholder="ex.: 90"
                    value={maxInterval} onChange={(e) => setMaxInterval(e.target.value)}
                    className="h-9 bg-black/40 border-white/10 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="interval" className="text-xs text-zinc-400">Intervalo (segundos)</Label>
                <Input
                  id="interval" type="number" min="1" placeholder="ex.: 30"
                  value={interval} onChange={(e) => setInterval(e.target.value)}
                  className="h-9 bg-black/40 border-white/10 text-sm max-w-xs"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-white/5">
          <Button onClick={handleSave} disabled={saving} className="h-9 mt-4">
            {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}
            Salvar configuração
          </Button>
          <Button
            variant="secondary"
            onClick={handleFire}
            disabled={firing}
            className="h-9 mt-4 border border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
          >
            {firing ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Zap className="size-4 mr-1.5" />}
            Disparar venda agora
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
