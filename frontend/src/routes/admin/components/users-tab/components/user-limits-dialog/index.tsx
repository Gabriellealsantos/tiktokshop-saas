import { useCallback, useEffect, useState } from "react";
import { Infinity as InfinityIcon, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Switch,
} from "@/components";
import { errMessage } from "@/routes/admin/components/viral-tab/components/image-upload";
import {
  getUserLimitOverrides,
  updateUserLimitOverrides,
} from "@/services/dailyLimitService";
import {
  flowTypeLabels,
  type FlowType,
  type UserLimitOverride,
  type UserLimitOverrides,
} from "@/models/dailyLimit";

interface UserLimitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
}

const labelFor = (flow: FlowType) => flowTypeLabels[flow] ?? flow;

/**
 * Exceção individual de cota. O que for marcado aqui vence o limite global e a
 * liberação por papel — é o nível mais específico da resolução.
 */
export function UserLimitsDialog({ open, onOpenChange, userId, userEmail }: UserLimitsDialogProps) {
  const [data, setData] = useState<UserLimitOverrides | null>(null);
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserLimitOverrides(userId);
      const payload = res.data as UserLimitOverrides;
      setData(payload);
      setDraft(Object.fromEntries(payload.flows.map((f) => [f.flowType, f.unlimited])));
    } catch (e) {
      toast.error(errMessage(e, "Falha ao carregar os limites do usuário."));
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }, [userId, onOpenChange]);

  // Carrega só ao abrir — o modal vive dentro do card de cada usuário da lista.
  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const toggle = (flow: FlowType) =>
    setDraft((prev) => ({ ...prev, [flow]: !prev[flow] }));

  const isDirty = Boolean(data?.flows.some((f) => draft[f.flowType] !== f.unlimited));

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const flows: UserLimitOverride[] = data.flows.map((f) => ({
        flowType: f.flowType,
        unlimited: Boolean(draft[f.flowType]),
      }));
      await updateUserLimitOverrides(userId, flows);
      toast.success("Limites do usuário atualizados.");
      onOpenChange(false);
    } catch (e) {
      toast.error(errMessage(e, "Falha ao salvar os limites do usuário."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10 text-zinc-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <InfinityIcon className="size-4 text-brand-400" />
            Limites de {data?.userName ?? userEmail}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Libere este usuário da cota diária em fluxos específicos. O que estiver marcado aqui
            vale mesmo que o fluxo tenha limite e o papel dele não esteja liberado.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500">
            <Loader2 className="size-4 animate-spin" /> Carregando…
          </div>
        ) : (
          <div className="space-y-2 py-2">
            {(data?.flows ?? []).map((flow) => {
              const on = Boolean(draft[flow.flowType]);
              return (
                <div
                  key={flow.flowType}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/30 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {labelFor(flow.flowType)}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {flow.updatedBy ? `liberado por ${flow.updatedBy}` : flow.flowType}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Label
                      className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 cursor-pointer"
                      onClick={() => toggle(flow.flowType)}
                    >
                      Ilimitado
                    </Label>
                    <Switch
                      checked={on}
                      onCheckedChange={() => toggle(flow.flowType)}
                      className="scale-90 origin-right"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || loading || !isDirty}>
            {saving ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
