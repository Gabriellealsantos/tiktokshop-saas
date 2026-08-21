import { Sparkles, RotateCcw, Loader2 } from "lucide-react";

interface ScriptEditorProps {
  speechText: string;
  setSpeechText: (text: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
}

export function ScriptEditor({
  speechText,
  setSpeechText,
  onGenerate,
  isGenerating,
  canGenerate,
}: ScriptEditorProps) {
  const hasScript = speechText.trim().length > 0;

  return (
    <div className="rounded-[28px] bg-[linear-gradient(180deg,hsl(255_100%_95%/0.02),hsl(258_90%_70%/0.008))] backdrop-blur-sm border border-white/10 ring-1 ring-inset ring-white/[0.06] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10)] p-6 sm:p-8 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-semibold text-text-1">
          Roteiro do Vídeo
        </label>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 border border-brand-500/40 px-3 py-1.5 text-xs font-semibold text-brand-300 hover:bg-brand-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : hasScript ? (
            <RotateCcw className="size-3.5" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          {isGenerating
            ? "Gerando..."
            : hasScript
              ? "Regerar roteiro"
              : "Gerar roteiro"}
        </button>
      </div>
      <textarea
        value={speechText}
        onChange={(e) => setSpeechText(e.target.value)}
        placeholder="Ex: Olá! Hoje vou te mostrar os benefícios deste incrível produto... (ou clique em 'Gerar roteiro')"
        className="w-full h-40 rounded-xl bg-white/5 border border-white/10 p-4 text-sm text-text-1 placeholder:text-text-3 focus:outline-none focus:border-accent-500 transition-colors resize-none"
      />
      <div className="flex justify-between items-center text-xs text-text-3">
        <span>Caracteres sugeridos: 50 - 500</span>
        <span>{speechText.length} caracteres</span>
      </div>
    </div>
  );
}
