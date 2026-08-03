import { Sparkles, Pencil, Check } from "lucide-react";
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
  onRegenerar?: () => void;
  podeRegenerar?: boolean;
  isRegenerando?: boolean;
}

const SUGESTAO_TITLES = ["SELFIE NATURAL", "ENCOSTADO", "DETALHE", "ESTILO LIVRE"];

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
}: PoseSelectorProps) {
  const isManual = poseSelecionada === "manual";

  return (
    <div className="mb-8 rounded-[28px] bg-[linear-gradient(180deg,hsl(255_100%_95%/0.02),hsl(258_90%_70%/0.008))] backdrop-blur-sm border border-white/10 ring-1 ring-inset ring-white/[0.06] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10)] p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="grid size-8 place-items-center rounded-full bg-brand-500/15 text-brand-400">
          <Sparkles className="size-4" />
        </div>
        <h2 className="text-xl font-extrabold text-text-1 tracking-tight">
          Como o avatar deve posar?
        </h2>
      </div>
      <p className="text-sm text-text-3 mb-8 ml-11">
        {isLoading
          ? "Gerando sugestões com base no seu produto…"
          : "Escolha uma sugestão ou descreva manualmente."}
      </p>

      <div className="flex flex-col gap-3 sm:gap-3.5">
        <AnimatePresence>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={`skel-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5 h-[80px]"
              >
                <div className="size-10 rounded-full bg-white/10 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-28 rounded-full bg-white/10 animate-pulse" />
                  <div className="h-3 w-[80%] rounded-full bg-white/5 animate-pulse" />
                </div>
              </motion.div>
            ))
          ) : (
            <>
              {sugestoes.map((texto, i) => {
                const isSelected = poseSelecionada === texto;
                const label = SUGESTAO_TITLES[i] || `SUGESTÃO ${i + 1}`;

                return (
                  <motion.div
                    key={`${texto.slice(0, 20)}-${i}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.08,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                  >
                    <button
                      onClick={() => setPoseSelecionada(texto)}
                      className={cn(
                        "group relative flex items-center justify-between gap-4 w-full p-5 sm:px-6 sm:py-5 rounded-2xl border text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                        isSelected
                          ? "bg-[linear-gradient(135deg,rgba(75,68,232,0.22)_0%,rgba(75,68,232,0.08)_100%)] border-brand-400 shadow-[0_8px_32px_-4px_rgba(75,68,232,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-md"
                          : "bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.015)_100%)] backdrop-blur-sm border-white/15 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-brand-500/50 hover:bg-[linear-gradient(135deg,rgba(75,68,232,0.12)_0%,rgba(255,255,255,0.03)_100%)] hover:shadow-[0_8px_30px_-6px_rgba(75,68,232,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5",
                      )}
                    >
                      <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
                        <div
                          className={cn(
                            "grid size-11 sm:size-12 shrink-0 place-items-center rounded-2xl transition-all duration-300 shadow-md border",
                            isSelected
                              ? "bg-linear-to-br from-brand-400 to-brand-600 border-brand-300 text-white shadow-[0_4px_16px_rgba(75,68,232,0.6)] scale-105"
                              : "bg-linear-to-br from-brand-500/30 via-brand-600/15 to-brand-700/10 border-brand-400/40 text-[17px] font-black text-brand-300 drop-shadow-[0_0_6px_rgba(150,140,255,0.5)] shadow-[inset_0_1px_3px_rgba(255,255,255,0.2)] group-hover:from-brand-500 group-hover:to-brand-600 group-hover:border-brand-300 group-hover:text-white group-hover:shadow-[0_4px_16px_rgba(75,68,232,0.6)] group-hover:scale-105",
                          )}
                        >
                          {isSelected ? (
                            <Check className="size-5 sm:size-6 stroke-[2.5]" />
                          ) : (
                            i + 1
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                          <span
                            className={cn(
                              "text-[11px] font-black uppercase tracking-[0.2em] transition-colors",
                              isSelected
                                ? "text-brand-300 drop-shadow-[0_0_8px_rgba(150,140,255,0.5)]"
                                : "text-brand-400/90 group-hover:text-brand-300",
                            )}
                          >
                            {label}
                          </span>
                          <span
                            className={cn(
                              "text-sm sm:text-[15px] leading-relaxed transition-colors pr-2",
                              isSelected
                                ? "text-white font-semibold tracking-wide"
                                : "text-white/85 font-medium group-hover:text-white",
                            )}
                          >
                            {texto}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-500/25 border border-brand-400/40 text-brand-300 text-xs font-extrabold uppercase tracking-wider shrink-0 shadow-inner">
                          <Check className="size-3.5 stroke-[3]" />
                          <span>Selecionado</span>
                        </div>
                      )}
                    </button>
                  </motion.div>
                );
              })}

              {/* CARD MANUAL */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: sugestoes.length * 0.08,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
              >
                <button
                  onClick={() => setPoseSelecionada("manual")}
                  className={cn(
                    "group relative flex items-center justify-between gap-4 w-full p-5 sm:px-6 sm:py-5 rounded-2xl border text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                    isManual
                      ? "bg-[linear-gradient(135deg,rgba(75,68,232,0.22)_0%,rgba(75,68,232,0.08)_100%)] border-brand-400 shadow-[0_8px_32px_-4px_rgba(75,68,232,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-md"
                      : "bg-[linear-gradient(135deg,rgba(75,68,232,0.06)_0%,rgba(255,255,255,0.02)_100%)] border-brand-500/35 border-dashed shadow-[0_4px_20px_-4px_rgba(0,0,0,0.35)] hover:border-brand-400 hover:border-solid hover:bg-[linear-gradient(135deg,rgba(75,68,232,0.14)_0%,rgba(255,255,255,0.04)_100%)] hover:shadow-[0_8px_30px_-6px_rgba(75,68,232,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5",
                  )}
                >
                  <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                    <div
                      className={cn(
                        "grid size-11 sm:size-12 shrink-0 place-items-center rounded-2xl transition-all duration-300 shadow-md border",
                        isManual
                          ? "bg-linear-to-br from-brand-400 to-brand-600 border-brand-300 text-white shadow-[0_4px_16px_rgba(75,68,232,0.6)] scale-105"
                          : "bg-linear-to-br from-brand-500/20 to-brand-600/10 border-brand-400/40 text-brand-300 group-hover:from-brand-500 group-hover:to-brand-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_4px_16px_rgba(75,68,232,0.6)] group-hover:scale-105",
                      )}
                    >
                      {isManual ? (
                        <Check className="size-5 sm:size-6 stroke-[2.5]" />
                      ) : (
                        <Pencil className="size-5 sm:size-6 stroke-[2]" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span
                        className={cn(
                          "text-[15px] sm:text-base font-bold tracking-tight transition-colors",
                          isManual ? "text-white" : "text-white/95 group-hover:text-white",
                        )}
                      >
                        Descrever manualmente
                      </span>
                      <span className="text-xs text-text-3 group-hover:text-text-2 transition-colors">
                        Escreva seu próprio prompt personalizado para orientar a pose do avatar
                      </span>
                    </div>
                  </div>

                  {isManual && (
                    <div className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-500/25 border border-brand-400/40 text-brand-300 text-xs font-extrabold uppercase tracking-wider shrink-0 shadow-inner">
                      <Check className="size-3.5 stroke-[3]" />
                      <span>Selecionado</span>
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
            animate={{ opacity: 1, height: "auto", marginTop: 20 }}
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
