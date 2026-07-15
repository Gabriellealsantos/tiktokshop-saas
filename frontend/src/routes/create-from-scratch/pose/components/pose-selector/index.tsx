import { Sparkles, Pencil, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components";
import { cn } from "@/utils/utils";
import { toast } from "sonner";
import { SUGESTOES } from "../../data";

interface PoseSelectorProps {
  isLoading: boolean;
  poseSelecionada: string | null;
  setPoseSelecionada: (id: string | null) => void;
  manualPoseText: string;
  setManualPoseText: (text: string) => void;
  isPoseValid: boolean;
}

export function PoseSelector({
  isLoading,
  poseSelecionada,
  setPoseSelecionada,
  manualPoseText,
  setManualPoseText,
  isPoseValid,
}: PoseSelectorProps) {
  return (
    <div className="mb-8 rounded-[24px] glass-surface p-5 sm:p-8 border border-white/10">
      <div className="flex items-center gap-3 mb-2">
        <div className="grid size-8 place-items-center rounded-full bg-brand-500/15 text-brand-400">
          <Sparkles className="size-4" />
        </div>
        <h2 className="text-xl font-extrabold text-text-1 tracking-tight">
          Como o avatar deve posar com o produto?
        </h2>
      </div>
      <p className="text-sm text-text-3 mb-8 ml-11">
        {isLoading
          ? "Gerando sugestões com base nas suas escolhas…"
          : "Escolha uma sugestão ou clique em descrever manualmente."}
      </p>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            // SKELETONS
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
            // OPÇÕES FIXAS (Cascata)
            SUGESTOES.map((opcao, i) => {
              const isSelected = poseSelecionada === opcao.id;

              return (
                <motion.div
                  key={opcao.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.1, // Stagger de 100ms
                    ease: [0.21, 0.47, 0.32, 0.98]
                  }}
                  className="h-full" // O container do framer-motion ocupa altura toda pra o botão expandir
                >
                  <button
                    onClick={() => setPoseSelecionada(opcao.id)}
                    className={cn(
                      "relative flex flex-col items-start gap-2 h-full w-full p-5 rounded-2xl border text-left transition-all duration-300",
                      opcao.isManual ? "border-dashed border-brand-500/30" : "border-solid",
                      isSelected
                        ? "bg-brand-500/10 border-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.3)]"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {opcao.isManual && <Pencil className="size-3.5 text-brand-400" />}
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        isSelected ? "text-brand-300" : "text-text-3"
                      )}>
                        {opcao.label}
                      </span>
                    </div>

                    {!opcao.isManual && (
                      <span className="text-sm text-text-1 leading-relaxed">
                        {opcao.text}
                      </span>
                    )}

                    {isSelected && (
                      <div className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-brand-500 text-white shadow-sm">
                        <Check className="size-3" />
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* TEXTAREA (Apenas quando manual selecionado) */}
      <AnimatePresence>
        {!isLoading && poseSelecionada === "manual" && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-brand-500/30 bg-brand-500/5 p-1 relative shadow-[inset_0_0_20px_rgba(75,68,232,0.05)]">
              <textarea
                value={manualPoseText}
                onChange={(e) => setManualPoseText(e.target.value)}
                placeholder="Descreva exatamente como quer que o avatar segure ou vista o produto na cena..."
                className="w-full h-32 rounded-xl bg-transparent px-4 py-4 text-sm text-text-1 placeholder:text-text-3 resize-none focus:outline-none"
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

      <div className="mt-10 flex justify-center">
        <Button
          disabled={isLoading || !isPoseValid}
          size="lg"
          className="rounded-full px-8 font-semibold shadow-[0_0_30px_-5px_rgba(75,68,232,0.5)]"
          onClick={() => {
            // TODO: fluxo de geração da imagem
            toast("Em breve: Fluxo de geração da imagem");
          }}
        >
          <Sparkles className="size-4 mr-2" />
          Gerar imagem
        </Button>
      </div>
    </div>
  );
}
