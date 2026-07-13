import { ChevronRight, Download, Loader2, Save, UserPlus } from "lucide-react";
import { Button } from "@/components";
import { cn } from "@/utils/utils";

interface PreviewPanelProps {
  nome: string;
  metadata: string;
  isGenerating: boolean;
  generatedImage: string | null;
  onGenerate?: () => void;
}

export function PreviewPanel({
  nome,
  metadata,
  isGenerating,
  generatedImage,
  onGenerate,
}: PreviewPanelProps) {
  return (
    <div className="sticky top-[calc(var(--navbar-height)+1.5rem)] z-30 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-text-1 px-1">Pré-visualização</h2>

      <div className="glass-surface rounded-[24px] p-4 flex flex-col gap-4">
        {/* CARD PRINCIPAL (ESTADOS) */}
        <div className="w-full aspect-[3/4] bg-surface-1/50 rounded-[16px] overflow-hidden border border-white/5 relative flex items-center justify-center">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3 text-brand-400">
              <Loader2 className="size-8 animate-spin" />
              <p className="text-sm font-medium animate-pulse">Gerando avatar com IA...</p>
            </div>
          ) : generatedImage ? (
            <img src={generatedImage} alt="Avatar gerado" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-4 px-6 opacity-70">
              <div className="grid size-16 place-items-center rounded-full bg-white/5 border border-white/10">
                <UserPlus className="size-6 text-brand-400" />
              </div>
              <p className="text-text-2 text-sm leading-relaxed max-w-[200px]">
                Preencha as configurações ao lado para visualizar o modelo do seu avatar.
              </p>
            </div>
          )}
        </div>

        {/* METADADOS */}
        <div className="px-1 flex flex-col">
          <p className="font-bold text-white text-base truncate">{nome || "Sem nome"}</p>
          <p className="text-text-3 text-xs truncate mt-0.5">{metadata || "Nenhuma característica definida"}</p>
        </div>

        {/* BOTÕES / LINK */}
        <div className="flex flex-col gap-2 mt-2">
          {generatedImage ? (
            <>
              <Button className="w-full btn-brand rounded-xl font-semibold h-11">
                <Save className="size-4 mr-2" />
                Salvar na biblioteca
              </Button>
              <Button variant="outline" className="w-full rounded-xl bg-surface-2 border-white/10 hover:bg-white/10 hover:text-white h-11">
                <Download className="size-4 mr-2" />
                Baixar imagem (JPEG)
              </Button>
            </>
          ) : null}

          <Button variant="link" className="text-brand-300 hover:text-brand-400 self-start p-0 h-auto font-medium mt-1">
            <ChevronRight className="size-4 mr-1" />
            Ver prompt gerado
          </Button>
        </div>
      </div>
    </div>
  );
}
