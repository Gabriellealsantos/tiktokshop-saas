import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  Label,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components";
import { errMessage } from "@/routes/admin/components/viral-tab/components/image-upload";
import {
  getStudioPromptConfig,
  updateStudioPromptConfig,
} from "@/services/studioConfigService";

// Placeholders que o backend injeta. Se algum sumir, a geração perde esse dado.
const REQUIRED_PLACEHOLDERS = [
  "{{productName}}",
  "{{productDescription}}",
  "{{sceneDescription}}",
  "{{pointOfView}}",
  "{{pose}}",
  "{{voiceDescription}}",
  "{{script}}",
];

export function StudioPromptTab() {
  const [text, setText] = useState("");
  const [original, setOriginal] = useState("");
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudioPromptConfig();
      setText(res.data.promptInstruction ?? "");
      setOriginal(res.data.promptInstruction ?? "");
      setUpdatedBy(res.data.updatedBy ?? null);
    } catch {
      toast.error("Falha ao carregar a instrução do prompt.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const missingPlaceholders = REQUIRED_PLACEHOLDERS.filter(
    (p) => !text.includes(p),
  );
  const isDirty = text.trim() !== original.trim();

  const doSave = async () => {
    setSaving(true);
    try {
      const res = await updateStudioPromptConfig(text);
      setOriginal(res.data.promptInstruction ?? "");
      setUpdatedBy(res.data.updatedBy ?? null);
      toast.success("Instrução do prompt atualizada.");
    } catch (e) {
      toast.error(errMessage(e, "Falha ao salvar a instrução."));
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  const handleSaveClick = () => {
    if (!text.trim()) {
      toast.error("A instrução não pode ficar vazia.");
      return;
    }
    // Se placeholders sumiram, pede confirmação antes de salvar.
    if (missingPlaceholders.length > 0) {
      setConfirmOpen(true);
      return;
    }
    doSave();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500 entrance">
        <Loader2 className="size-4 animate-spin" /> Carregando instrução…
      </div>
    );
  }

  return (
    <div className="space-y-4 entrance">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-red-400 max-w-2xl">
          Esta é a instrução mestre que orienta a IA a escrever o prompt de
          vídeo (Veo3). Ela vale para todos os vídeos gerados no fluxo "Criar do
          zero". Os campos entre chaves duplas (como{" "}
          <code className="text-red-300 font-semibold">
            {"{{productName}}"}
          </code>
          ) são preenchidos automaticamente — não os remova.
        </p>
        <Button
          variant="secondary"
          onClick={load}
          className="size-9 p-0 rounded-full shrink-0"
          aria-label="Recarregar"
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {missingPlaceholders.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-300">
          <AlertTriangle className="size-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Campos removidos do texto:</p>
            <p className="text-amber-300/80 text-xs mt-1">
              {missingPlaceholders.join(", ")} — sem eles, esses dados não
              entram no prompt gerado.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs text-zinc-400">Instrução do prompt</Label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className="w-full min-h-[420px] rounded-[16px] border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-white font-mono resize-y focus:outline-none focus:border-brand-500/50"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] text-zinc-500 truncate">
          {updatedBy ? `Editado por ${updatedBy}` : "Padrão do sistema"}
        </span>
        <Button
          onClick={handleSaveClick}
          disabled={saving || !isDirty}
          className="h-9 shrink-0"
        >
          {saving ? (
            <Loader2 className="size-4 mr-1.5 animate-spin" />
          ) : (
            <Save className="size-4 mr-1.5" />
          )}
          Salvar
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-zinc-950/90 backdrop-blur-2xl border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Salvar mesmo sem alguns campos?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Você removeu {missingPlaceholders.join(", ")} da instrução. Sem
              esses campos, os vídeos gerados vão perder essas informações.
              Deseja salvar assim mesmo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-surface-2 border-white/10 hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={doSave} className="btn-brand">
              Salvar assim mesmo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
