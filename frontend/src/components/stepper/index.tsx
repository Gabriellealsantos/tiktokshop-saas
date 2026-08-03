import { Check } from "lucide-react";
import { cn } from "@/utils/utils";
import { motion } from "motion/react";

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="mb-8">
      <div className="flex w-full flex-wrap items-center gap-y-3 sm:gap-y-0 sm:flex-nowrap">
        {steps.map((step, index) => {
          const isCurrent = index === current;
          const isCompleted = index < current;
          const isFuture = index > current;

          return (
            <div
              key={step}
              className={cn(
                "flex items-center",
                index < steps.length - 1 ? "flex-1" : "shrink-0"
              )}
            >
              <motion.div
                layout
                className={cn(
                  "flex items-center gap-2.5 rounded-full px-4 py-2 sm:px-4 sm:py-2.5 transition-all duration-300",
                  isCurrent && "bg-[linear-gradient(135deg,rgba(75,68,232,0.25)_0%,rgba(75,68,232,0.10)_100%)] border border-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.45),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-md",
                  isCompleted &&
                    "bg-white/5 border border-white/12 backdrop-blur-[14px]",
                  isFuture &&
                    "bg-white/[0.04] border border-white/10 backdrop-blur-[14px]"
                )}
              >
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full text-xs font-bold transition-all duration-300",
                    isCurrent && "bg-brand-500/25 border border-brand-400/50 text-brand-300 shadow-[0_0_10px_rgba(75,68,232,0.4)]",
                    isCompleted && "bg-white/20 text-white",
                    isFuture && "bg-white/10 text-white/45"
                  )}
                >
                  {isCompleted ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-sm transition-colors",
                    isCurrent && "text-white font-bold tracking-wide drop-shadow-[0_0_8px_rgba(150,140,255,0.4)]",
                    isCompleted && "font-medium text-white/60",
                    isFuture && "font-medium text-white/45"
                  )}
                >
                  {step}
                </span>
              </motion.div>
              {index < steps.length - 1 && (
                <div className="hidden sm:block flex-1 h-px bg-white/12 mx-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
