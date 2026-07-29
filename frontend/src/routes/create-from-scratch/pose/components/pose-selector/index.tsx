import { Sparkles, Pencil, Check, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components";
import { cn } from "@/utils/utils";

interface PoseSelectorProps {
  isLoading: boolean;
  sugestoes: string[];
  poseSelecionada: string | null;
  setPoseSelecionada: (value: string | null) => void;
  manualPoseText: string;
  setManualPoseText: (text: string) => void;
  isPoseValid: boolean;
  onGenerate: () => void;
  isGenerating: boolean;
  generatedImage: string | null;
  onRegenerar: () => void;
  podeRegenerar: boolean;
  isRegenerando: boolean;
}

export function PoseSelector({
  isLoading,
  sugestoes,
  poseSelecionada,
  setPoseSelecionada,
  manualPoseText,
  setManualPoseText,
  isPoseValid,
  onGenerate,
  isGenerating,
  generatedImage,
  onRegenerar,
  podeRegenerar,
  isRegenerando,
}: PoseSelectorProps) {
  const isManual = poseSelecionada === "manual";

  return (
    <div className="mb-8 rounded-[24px] glass-surface p-5 sm:p-8 border border-white/10">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-full bg-brand-500/15 text-brand-400">
            <Sparkles className="size-4" />
          </div>
          <h2 className="text-xl font-extrabold text-text-1 tracking-tight">
            Como o avatar deve posar com o produto?
          </h2>
        </div>

        {!isLoading && podeRegenerar && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerar}
            disabled={isRegenerando}
            className="shrink-0 rounded-full bg-surface-2 border-white/10 hover:bg-white/10"
          >
            <RefreshCw
              className={cn("size-4 mr-2", isRegenerando && "animate-spin")}
            />
            {isRegenerando ? "Gerando..." : "Gerar outras 3"}
          </Button>
        )}
      </div>
      <p className="text-sm text-text-3 mb-8 ml-11">
        {isLoading
          ? "Gerando sugestões com base no seu produto…"
          : "Escolha uma sugestão ou clique em descrever manualmente."}
      </p>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={`skel-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5 h-[140px]"
              >
                <div className="h-3 w-1/3 rounded-full bg-white/10 animate-pulse" />
                <div className="space-y-2 mt-2">
                  <div className="h-2.5 w-full rounded-full bg-white/5 animate-pulse" />
                  <div className="h-2.5 w-[90%] rounded-full bg-white/5 animate-pulse" />
                  <div className="h-2.5 w-[60%] rounded-full bg-white/5 animate-pulse" />
                </div>
              </motion.div>
            ))
          ) : (
            <>
              {sugestoes.map((texto, i) => {
                const isSelected = poseSelecionada === texto;
                return (
                  <motion.div
                    key={`${texto.slice(0, 20)}-${i}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.1,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                    className="h-full"
                  >
                    <button
                      onClick={() => setPoseSelecionada(texto)}
                      className={cn(
                        "relative flex flex-col items-start gap-2 h-full w-full p-5 rounded-2xl border text-left transition-all duration-300 border-solid",
                        isSelected
                          ? "bg-brand-500/10 border-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.3)]"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5",
                      )}
                    >
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest mb-1",
                          isSelected ? "text-brand-300" : "text-text-3",
                        )}
                      >
                        Sugestão {i + 1}
                      </span>
                      <span className="text-sm text-text-1 leading-relaxed">
                        {texto}
                      </span>
                      {isSelected && (
                        <div className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-brand-500 text-white shadow-sm">
                          <Check className="size-3" />
                        </div>
                      )}
                    </button>
                  </motion.div>
                );
              })}

              {/* CARD MANUAL */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: sugestoes.length * 0.1,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="h-full"
              >
                <button
                  onClick={() => setPoseSelecionada("manual")}
                  className={cn(
                    "relative flex flex-col items-start gap-2 h-full w-full p-5 rounded-2xl border text-left transition-all duration-300 border-dashed border-brand-500/30",
                    isManual
                      ? "bg-brand-500/10 border-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.3)]"
                      : "bg-white/5 hover:bg-white/10 hover:-translate-y-0.5",
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Pencil className="size-3.5 text-brand-400" />
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        isManual ? "text-brand-300" : "text-text-3",
                      )}
                    >
                      Descrever manualmente
                    </span>
                  </div>
                  {isManual && (
                    <div className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-brand-500 text-white shadow-sm">
                      <Check className="size-3" />
                    </div>
                  )}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {!isLoading && isManual && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="relative">
              <textarea
                value={manualPoseText}
                onChange={(e) => setManualPoseText(e.target.value)}
                placeholder="Descreva exatamente como quer que o avatar segure ou use o produto na cena..."
                className="w-full h-32 rounded-2xl border border-brand-500/30 bg-brand-500/5 px-4 py-4 text-sm text-text-1 placeholder:text-text-3 resize-none transition-colors focus:outline-none focus:border-brand-500"
                autoFocus
              />
              <div className="absolute bottom-3 right-4 pointer-events-none">
                <span className="text-[10px] text-text-3 font-medium uppercase tracking-widest">
                  Comando livre
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 flex flex-col items-center gap-6">
        <Button
          disabled={isLoading || !isPoseValid || isGenerating}
          size="lg"
          className="rounded-full px-8 font-semibold shadow-[0_0_30px_-5px_rgba(75,68,232,0.5)]"
          onClick={onGenerate}
        >
          <Sparkles
            className={cn("size-4 mr-2", isGenerating && "animate-spin")}
          />
          {isGenerating ? "Gerando imagem..." : "Gerar imagem"}
        </Button>

        {generatedImage && (
          <div className="w-full max-w-80 overflow-hidden rounded-2xl border border-brand-500/30 shadow-lg">
            <img
              src={generatedImage}
              alt="Imagem gerada"
              className="w-full h-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}
