import { useState } from "react";
import {
  ChevronRight,
  Copy,
  Download,
  Loader2,
  Save,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components";
import { downloadStorageFile } from "@/services/avatarService";

interface PreviewPanelProps {
  nome: string;
  metadata: string;
  isGenerating: boolean;
  generatedImage: string | null;
  prompt?: string | null;
  canSave?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
}

export function PreviewPanel({
  nome,
  metadata,
  isGenerating,
  generatedImage,
  prompt = null,
  canSave = false,
  isSaving = false,
  onSave,
}: PreviewPanelProps) {
  const [promptOpen, setPromptOpen] = useState(false);

  const copyPrompt = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    toast.success("Prompt copiado.");
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    const filename = `${nome || "avatar"}.jpg`;
    try {
      const response = await downloadStorageFile(generatedImage, filename);
      const objectUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error("Não foi possível baixar a imagem.");
    }
  };

  return (
    <div className="sticky top-[calc(var(--navbar-height)+1.5rem)] z-30 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-text-1 px-1">Pré-visualização</h2>

      <div className="glass-container rounded-[24px] p-4 flex flex-col gap-4">
        {/* CARD PRINCIPAL (ESTADOS) */}
        <div className="w-full aspect-[3/4] bg-white/[0.03] backdrop-blur-xl rounded-[16px] overflow-hidden border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] relative flex items-center justify-center">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3 text-brand-400">
              <Loader2 className="size-8 animate-spin" />
              <p className="text-sm font-medium animate-pulse">
                Gerando avatar com IA...
              </p>
            </div>
          ) : generatedImage ? (
            <img
              src={generatedImage}
              alt="Avatar gerado"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-4 px-6 opacity-70">
              <div className="grid size-16 place-items-center rounded-full bg-white/5 border border-white/10">
                <UserPlus className="size-6 text-brand-400" />
              </div>
              <p className="text-text-2 text-sm leading-relaxed max-w-[200px]">
                Preencha as configurações ao lado para visualizar o modelo do
                seu avatar.
              </p>
            </div>
          )}
        </div>

        {/* METADADOS */}
        <div className="px-1 flex flex-col">
          <p className="font-bold text-white text-base truncate">
            {nome || "Sem nome"}
          </p>
          <p className="text-text-3 text-xs truncate mt-0.5">
            {metadata || "Nenhuma característica definida"}
          </p>
        </div>

        {/* BOTÕES / LINK */}
        <div className="flex flex-col gap-2 mt-2">
          {generatedImage ? (
            <>
              {canSave && (
                <Button
                  onClick={onSave}
                  disabled={isSaving}
                  className="w-full btn-brand rounded-xl font-semibold h-11"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="size-4 mr-2" />
                      Salvar na biblioteca
                    </>
                  )}
                </Button>
              )}
              <button
                type="button"
                onClick={handleDownload}
                className="w-full btn-3d-neutral rounded-xl font-semibold h-11 inline-flex items-center justify-center text-sm cursor-pointer transition-all outline-none"
              >
                <Download className="size-4 mr-2" />
                Baixar imagem (JPEG)
              </button>
            </>
          ) : null}

          <Button
            variant="link"
            onClick={() => setPromptOpen(true)}
            disabled={!prompt}
            className="text-brand-300 hover:text-brand-400 self-start p-0 h-auto font-medium mt-1 disabled:opacity-40"
          >
            <ChevronRight className="size-4 mr-1" />
            Ver prompt gerado
          </Button>
        </div>
      </div>

      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent className="max-w-lg bg-zinc-950/80 backdrop-blur-2xl border-white/20 text-white">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-bold">
              Prompt gerado
            </DialogTitle>
          </DialogHeader>
          <p className="max-h-[50vh] overflow-y-auto rounded-xl bg-surface-2 border border-white/10 p-4 text-sm leading-relaxed text-text-2 whitespace-pre-wrap">
            {prompt}
          </p>
          <Button
            onClick={copyPrompt}
            className="btn-brand w-full h-11 rounded-xl"
          >
            <Copy className="size-4 mr-2" />
            Copiar prompt
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
