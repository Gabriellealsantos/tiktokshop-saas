import { motion } from "motion/react";
import { Copy, ArrowRight } from "lucide-react";
import { Button } from "@/components";

interface PromptResultProps {
  finalPrompt: string;
  handleCopy: () => void;
  resetPrompt: () => void;
}

export function PromptResult({ finalPrompt, handleCopy, resetPrompt }: PromptResultProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col"
    >
      <div className="rounded-xl border border-white/10 bg-deep p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white text-[15px]">Prompt gerado (em inglês)</h3>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-2 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md"
          >
            <Copy className="size-3" />
            Copiar
          </button>
        </div>

        <div className="bg-[#0b0914] rounded-lg p-4 border border-white/5 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <pre className="font-mono text-xs text-text-2 whitespace-pre-wrap leading-[1.6]">
            {finalPrompt}
          </pre>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="https://lumaai.com/dream-machine"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 btn-brand inline-flex items-center justify-center h-10 text-sm rounded-xl font-semibold px-4 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_0_15px_-4px_rgba(75,68,232,0.6)]"
        >
          Abrir Google Flow
          <ArrowRight className="ml-1.5 size-3.5" />
        </a>
        <Button
          variant="outline"
          className="flex-1 h-10 text-sm rounded-xl"
          onClick={() => resetPrompt()}
        >
          Gerar outro
        </Button>
      </div>
    </motion.section>
  );
}
