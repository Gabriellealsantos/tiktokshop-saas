import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";

import { Button, Label, Switch } from "@/components";
import {
  getAuthSecuritySettings, updateAuthSecuritySettings,
  type AuthSecuritySettings,
} from "@/services/authSecurityService";

export function SecurityTab() {
  const [singleSession, setSingleSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAuthSecuritySettings();
      const cfg: AuthSecuritySettings = res.data;
      setSingleSession(cfg.singleSessionEnforced ?? false);
    } catch {
      toast.error("Falha ao carregar a configuração de segurança.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAuthSecuritySettings({ singleSessionEnforced: singleSession });
      toast.success("Configuração de segurança salva.");
    } catch {
      toast.error("Falha ao salvar a configuração de segurança.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
        <Loader2 className="size-4 animate-spin" /> Carregando configuração…
      </div>
    );
  }

  return (
    <div className="space-y-4 entrance">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-400 max-w-2xl">
          Regras de acesso que valem para todas as contas do sistema.
        </p>
        <Button variant="secondary" onClick={load} className="size-9 shrink-0 p-0 rounded-full" aria-label="Recarregar">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-dash-border bg-dash-surface backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_32px_-8px_oklch(0_0_0/0.5),inset_0_1px_0_0_oklch(1_0_0/0.10)] p-5 max-w-2xl duration-200 before:absolute before:inset-0 before:pointer-events-none before:bg-dash-tint after:absolute after:inset-0 after:pointer-events-none after:bg-linear-to-b after:from-white/[0.07] after:via-transparent after:to-transparent">
        <div className="relative z-10 space-y-5">
        <div className="flex items-center gap-3">
          <Switch checked={singleSession} onCheckedChange={setSingleSession} />
          <Label className="text-sm text-zinc-300 flex items-center gap-2">
            {singleSession
              ? <ShieldCheck className="size-4 text-emerald-400" />
              : <ShieldOff className="size-4 text-zinc-500" />}
            Bloquear login simultâneo em todas as contas
          </Label>
        </div>

        <div className="rounded-[12px] border border-white/5 bg-black/20 p-4 space-y-2 text-xs text-zinc-400">
          <p>
            Com a chave ligada, cada conta só pode estar em uso em um lugar por vez. Se alguém já
            estiver com sessão ativa, um segundo login na mesma conta é <strong>recusado</strong> —
            a pessoa nem chega a entrar.
          </p>
          <p>
            A sessão é liberada na hora quando o usuário clica em "Sair". Se ele apenas fechar o
            navegador, a liberação acontece sozinha em até 15 minutos.
          </p>
          <p>
            Contas de <strong>administrador</strong> nunca são bloqueadas por essa regra — mesmo com
            a chave ligada, um admin sempre consegue entrar (inclusive para desligar essa
            configuração se algo travar).
          </p>
        </div>

        <div className="pt-1 border-t border-white/5">
          <Button onClick={handleSave} disabled={saving} className="h-9 mt-4">
            {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}
            Salvar configuração
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
