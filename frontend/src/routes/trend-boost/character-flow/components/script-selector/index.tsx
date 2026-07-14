import { motion } from "motion/react";
import { Loader2, Sparkles, Check } from "lucide-react";
import { Button } from "@/components";
import { cn } from "@/utils/utils";

interface ScriptSelectorProps {
  scripts: any[];
  selectedScript: string | null;
  setSelectedScript: (id: string | null) => void;
  selectedTone: string | null;
  isGeneratingScripts: boolean;
  generateScripts: (tone: string) => void;
  generatePrompt: () => void;
}

export function ScriptSelector({
  scripts,
  selectedScript,
  setSelectedScript,
  selectedTone,
  isGeneratingScripts,
  generateScripts,
  generatePrompt,
}: ScriptSelectorProps) {
  return (
    <motion.section
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: "auto", marginTop: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      className="overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3 pt-4 border-t border-white/5">
        <h2 className="text-lg font-bold text-white">Escolha um roteiro</h2>
        <button
          onClick={() => {
            setSelectedScript(null);
            if (selectedTone) {
              generateScripts(selectedTone);
            }
          }}
          disabled={isGeneratingScripts}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors disabled:opacity-50"
        >
          {isGeneratingScripts ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
          Gerar novos
        </button>
      </div>

      <div className="flex flex-col gap-2 mb-5">
        {scripts.map((script) => {
          const isSelected = selectedScript === script.id;
          return (
            <button
              key={script.id}
              onClick={() => setSelectedScript(script.id)}
              className={cn(
                "relative text-left p-3.5 rounded-xl border transition-all duration-200 outline-none",
                isSelected
                  ? "bg-brand-500/10 border-brand-500 shadow-[0_0_15px_-4px_rgba(75,68,232,0.4)]"
                  : "bg-deep border-white/10 hover:border-white/20"
              )}
            >
              <h4 className="font-bold text-white text-[13px] mb-1">{script.title}</h4>
              <p className="text-[12px] text-text-2 leading-snug mb-2.5">
                {script.description}
              </p>
              <div className={cn(
                "pl-3 py-1 border-l-2 text-[13px] font-medium italic",
                isSelected ? "border-brand-500 text-brand-100 bg-brand-500/5 rounded-r" : "border-white/20 text-white/80"
              )}>
                "{script.quote}"
              </div>

              {isSelected && (
                <div className="brand-gradient accent-glow absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full z-10">
                  <Check className="size-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Button
        className="w-full btn-brand h-10 text-sm"
        disabled={!selectedScript}
        onClick={() => generatePrompt()}
      >
        <Sparkles className="size-3.5 mr-2" />
        Gerar prompt do vídeo
      </Button>
    </motion.section>
  );
}
