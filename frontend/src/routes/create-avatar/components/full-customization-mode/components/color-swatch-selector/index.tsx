import { Check } from "lucide-react";
import { cn } from "@/utils/utils";

export function ColorSwatchCard({ name, color, isSelected, onClick }: { name: string, color: string, isSelected: boolean, onClick: () => void }) {
  return (
    <button
      type="button"
      title={name}
      onClick={onClick}
      className={cn(
        "size-[76px] rounded-2xl transition-all duration-300 relative outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0",
        isSelected
          ? "ring-2 ring-brand-500 shadow-[0_0_20px_-4px_rgba(75,68,232,0.5)] scale-105"
          : "ring-1 ring-white/10 hover:ring-white/30 hover:scale-105"
      )}
      style={{ backgroundColor: color }}
    >
      {isSelected && (
        <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-brand-500 text-white shadow-sm ring-2 ring-surface-1">
          <Check className="size-3.5" />
        </span>
      )}
    </button>
  );
}

export function ColorSwatchSelector({ options, value, onChange }: { options: { name: string, color: string }[], value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((opt) => (
        <ColorSwatchCard
          key={opt.name}
          name={opt.name}
          color={opt.color}
          isSelected={value === opt.name}
          onClick={() => onChange(opt.name)}
        />
      ))}
    </div>
  );
}
