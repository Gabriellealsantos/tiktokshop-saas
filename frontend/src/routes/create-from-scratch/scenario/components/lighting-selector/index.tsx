import { Check } from "lucide-react";
import { cn } from "@/utils/utils";
import { ILUMINACAO } from "../../data";

interface LightingSelectorProps {
  lightingSelected: string | null;
  setLightingSelected: (id: string) => void;
}

export function LightingSelector({ lightingSelected, setLightingSelected }: LightingSelectorProps) {
  return (
    <div className="mb-10">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-6 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
          3
        </span>
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-text-3">
          Iluminação
        </h2>
      </div>

      <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        {ILUMINACAO.map((item) => {
          const isSelected = lightingSelected === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setLightingSelected(item.id)}
              className={cn(
                "group relative overflow-hidden rounded-2xl aspect-[16/10] flex flex-col items-center justify-center transition-all duration-300 bg-[#0F0D15]",
                isSelected
                  ? "ring-2 ring-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.4)]"
                  : "ring-1 ring-white/10 hover:ring-white/20 hover:-translate-y-1 hover:shadow-lg"
              )}
            >
              {/* Background Color Glow */}
              <div className={cn("absolute inset-0 opacity-60 group-hover:opacity-80 transition-opacity duration-500 bg-linear-to-br", item.gradient)} />
              
              {/* Smooth Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#09080E]/90 via-[#09080E]/20 to-transparent pointer-events-none" />

              {/* Centered Icon */}
              <div className="relative z-10 flex flex-1 items-center justify-center w-full pt-4">
                <Icon className={cn("size-7 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1", item.iconColor)} />
              </div>

              {/* Bottom Label */}
              <div className="relative z-10 w-full p-3 text-center">
                <span className="font-bold text-white text-[11px] uppercase tracking-wider drop-shadow-md">
                  {item.label}
                </span>
              </div>

              {isSelected && (
                <>
                  <div className="absolute inset-0 border-2 border-brand-500 rounded-2xl pointer-events-none z-20" />
                  <div className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-brand-500 text-white shadow-sm z-20">
                    <Check className="size-3" />
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
