import { Loader2, Sparkles, Check } from "lucide-react";
import { Button } from "@/components";
import { cn } from "@/utils/utils";
import type { ViralTone } from "@/models/viral";
import { toneIcon } from "../../data";

interface ToneSelectorProps {
  tones: ViralTone[];
  selectedTone: string | null;
  setSelectedTone: (tone: string) => void;
  isGeneratingScripts: boolean;
  generateScripts: (tone: string) => void;
  hasScripts: boolean;
}

export function ToneSelector({
  tones,
  selectedTone,
  setSelectedTone,
  isGeneratingScripts,
  generateScripts,
  hasScripts,
}: ToneSelectorProps) {
  return (
    <section className={cn(hasScripts ? "mb-6" : "mb-0")}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white">Escolha o tom do vídeo</h2>
        <div className="px-2 py-0.5 rounded-full bg-deep border border-white/5 text-[9px] font-bold tracking-wider text-text-2 uppercase">
          8 Segundos · 3 Roteiros
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
        {tones.map((tone) => {
          const isSelected = selectedTone === tone.slug;
          const Icon = toneIcon(tone.slug);
          return (
            <button
              key={tone.slug}
              onClick={() => setSelectedTone(tone.slug)}
              className={cn(
                "relative flex flex-col items-center text-center gap-1 p-2 rounded-xl border transition-all duration-200 outline-none",
                isSelected
                  ? "bg-brand-500/10 border-brand-500 shadow-[0_0_15px_-4px_rgba(75,68,232,0.4)]"
                  : "bg-deep/50 border-white/10 hover:border-white/20 hover:bg-deep"
              )}
            >
              <div className={cn(
                "p-1 rounded-md mb-0.5",
                isSelected ? "bg-brand-500 text-white" : "bg-white/5 text-text-2"
              )}>
                <Icon className="size-3.5" />
              </div>
              <span className={cn("font-bold text-[11px]", isSelected ? "text-white" : "text-text-1")}>
                {tone.label}
              </span>
              <span className="text-[9px] text-text-3 leading-tight px-0.5">
                {tone.description}
              </span>

              {isSelected && (
                <div className="brand-gradient accent-glow absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full z-10">
                  <Check className="size-2.5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-text-3 mb-4">
        Duração fixa de 8 segundos. A IA analisa a cena do personagem e gera 3 roteiros virais prontos.
      </p>

      {!hasScripts && (
        <Button
          className="w-full btn-brand h-10 text-sm"
          disabled={!selectedTone || isGeneratingScripts}
          onClick={() => selectedTone && generateScripts(selectedTone)}
        >
          {isGeneratingScripts ? (
            <>
              <Loader2 className="size-3.5 mr-2 animate-spin" />
              Analisando com IA...
            </>
          ) : (
            <>
              <Sparkles className="size-3.5 mr-2" />
              Analisar com IA & gerar 3 roteiros
            </>
          )}
        </Button>
      )}
    </section>
  );
}
