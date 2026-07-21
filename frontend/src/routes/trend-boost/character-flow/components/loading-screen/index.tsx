import { motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { Page } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { cn } from "@/utils/utils";
import type { ViralCharacter } from "@/models/viral";

interface LoadingScreenProps {
  character: ViralCharacter;
  loadingStage: number;
}

export function LoadingScreen({ character, loadingStage }: LoadingScreenProps) {
  return (
    <AppShell>
      <Page className="pt-0 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl animate-pulse" />
            <div className="relative size-32 rounded-full overflow-hidden border-4 border-brand-500 shadow-[0_0_30px_rgba(75,68,232,0.5)]">
              <img src={character.imageUrl ?? undefined} alt={character.name} className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <h2 className="text-3xl font-extrabold text-white mb-3">
            Montando o roteiro de{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(120deg, var(--brand-300) 0%, var(--brand-500) 100%)" }}>
              {character.name}
            </span>
          </h2>
          <p className="text-text-2 mb-10 max-w-sm">
            A IA está estruturando cena, ritmo e fala em inglês cinematográfico.
          </p>

          <div className="flex flex-col gap-3 w-full">
            {[
              { step: 1, text: "Analisando referência visual" },
              { step: 2, text: "Compondo direção de cena" },
              { step: 3, text: "Refinando fala e timing" }
            ].map((item) => {
              const isActive = loadingStage === item.step;
              const isPast = loadingStage > item.step;
              const isPendingStage = loadingStage < item.step;

              return (
                <motion.div
                  key={item.step}
                  layout
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-full border transition-all duration-300",
                    isActive ? "bg-brand-500/10 border-brand-500 shadow-[0_0_20px_-5px_rgba(75,68,232,0.4)]" : "bg-surface-2 border-white/5",
                    isPendingStage ? "opacity-50" : "opacity-100"
                  )}
                >
                  <div className="size-6 flex items-center justify-center shrink-0">
                    {isPast ? (
                      <Check className="size-5 text-brand-400" />
                    ) : isActive ? (
                      <Loader2 className="size-5 text-brand-400 animate-spin" />
                    ) : (
                      <div className="size-2 rounded-full bg-white/20" />
                    )}
                  </div>
                  <span className={cn(
                    "font-medium",
                    isActive ? "text-brand-100" : isPast ? "text-white" : "text-text-3"
                  )}>
                    {item.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Page>
    </AppShell>
  );
}
