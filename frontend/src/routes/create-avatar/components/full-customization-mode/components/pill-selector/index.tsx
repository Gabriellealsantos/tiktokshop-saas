import { Check } from "lucide-react";
import { cn } from "@/utils/utils";

export function PillSelector({ options, value, onChange }: { options: string[], value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              isSelected
                ? "bg-brand-500/15 border border-brand-500 text-brand-300 shadow-[0_0_20px_-4px_rgba(75,68,232,0.3)] pr-8"
                : "bg-surface-2 border border-white/5 text-text-2 hover:border-white/15 hover:text-white"
            )}
          >
            {opt}
            {isSelected && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 grid size-4 place-items-center rounded-full bg-brand-500 text-white">
                <Check className="size-2.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
