import { useCallback, useEffect, useState } from "react";
import { Loader2, Play, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

import {
  Button, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch,
} from "@/components";
import type { NotificationSoundSettings } from "@/models/notification";
import {
  getSoundSettings, updateSoundSettings,
} from "@/services/notificationService";
import {
  SOUND_KEYS, SOUND_LABELS, playSoundKey, setCachedSettings,
} from "@/utils/notification-sound";

type TypeRow = {
  label: string;
  hint: string;
  field: "saleSoundKey" | "announcementSoundKey" | "systemSoundKey";
};

const ROWS: TypeRow[] = [
  { label: "Venda ao vivo", hint: "Toca no toast de prova social de venda.", field: "saleSoundKey" },
  { label: "Aviso / anúncio", hint: "Comunicados enviados pelo painel.", field: "announcementSoundKey" },
  { label: "Sistema", hint: "Mensagens automáticas do sistema.", field: "systemSoundKey" },
];

export function NotificationSoundTab() {
  const [enabled, setEnabled] = useState(true);
  const [keys, setKeys] = useState<Record<TypeRow["field"], string>>({
    saleSoundKey: "cash",
    announcementSoundKey: "ding",
    systemSoundKey: "chime",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSoundSettings();
      const cfg: NotificationSoundSettings = res.data;
      setEnabled(cfg.enabled ?? true);
      setKeys({
        saleSoundKey: cfg.saleSoundKey ?? "cash",
        announcementSoundKey: cfg.announcementSoundKey ?? "ding",
        systemSoundKey: cfg.systemSoundKey ?? "chime",
      });
    } catch {
      toast.error("Falha ao carregar a configuração de som.");
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
      const res = await updateSoundSettings({ enabled, ...keys });
      setCachedSettings(res.data as NotificationSoundSettings);
      toast.success("Som das notificações salvo.");
    } catch {
      toast.error("Falha ao salvar a configuração de som.");
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
          Define o som que toca em cada tipo de notificação. Cada usuário pode silenciar o próprio som
          nas configurações da conta.
        </p>
        <Button variant="secondary" onClick={load} className="size-9 shrink-0 p-0 rounded-full" aria-label="Recarregar">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <div className="rounded-[16px] border border-white/5 bg-white/[0.02] p-5 space-y-5 max-w-2xl">
        <div className="flex items-center gap-3">
          <Switch checked={enabled} onCheckedChange={setEnabled} />
          <Label className="text-sm text-zinc-300 flex items-center gap-2">
            {enabled ? <Volume2 className="size-4 text-emerald-400" /> : <VolumeX className="size-4 text-zinc-500" />}
            Som das notificações {enabled ? "ativado" : "desligado (global)"}
          </Label>
        </div>

        <div className={enabled ? "space-y-4" : "space-y-4 opacity-50 pointer-events-none"}>
          {ROWS.map((row) => (
            <div key={row.field} className="space-y-1.5 rounded-[12px] border border-white/5 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label className="text-sm text-zinc-300">{row.label}</Label>
                  <p className="text-xs text-zinc-500">{row.hint}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={keys[row.field]}
                    onValueChange={(v) => setKeys((prev) => ({ ...prev, [row.field]: v }))}
                  >
                    <SelectTrigger className="h-9 w-36 bg-black/40 border-white/10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300">
                      {SOUND_KEYS.map((k) => (
                        <SelectItem key={k} value={k}>{SOUND_LABELS[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="secondary"
                    onClick={() => playSoundKey(keys[row.field])}
                    className="size-9 shrink-0 p-0 rounded-full"
                    aria-label={`Ouvir ${row.label}`}
                  >
                    <Play className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-1 border-t border-white/5">
          <Button onClick={handleSave} disabled={saving} className="h-9 mt-4">
            {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}
            Salvar configuração
          </Button>
        </div>
      </div>
    </div>
  );
}
