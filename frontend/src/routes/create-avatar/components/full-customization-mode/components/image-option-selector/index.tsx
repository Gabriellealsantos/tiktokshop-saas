import { Check } from "lucide-react";
import { cn } from "@/utils/utils";

export function ImageOptionCard({ name, image, color, isSelected, onClick }: { name: string, image?: string, color?: string, isSelected: boolean, onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-[20px] aspect-[4/5] text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        isSelected
          ? "ring-2 ring-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.4)]"
          : "ring-1 ring-white/10 hover:ring-white/20 hover:-translate-y-1 hover:shadow-lg bg-surface-2"
      )}
    >
      {image ? (
        <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 w-full h-full" style={{ background: color || 'var(--surface-3)' }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="font-bold text-white text-sm drop-shadow-md truncate">{name}</p>
      </div>
      {isSelected && (
        <>
          <div className="absolute inset-0 border-2 border-brand-500 rounded-[20px] pointer-events-none" />
          <div className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-brand-500 text-white shadow-sm">
            <Check className="size-3" />
          </div>
        </>
      )}
    </button>
  );
}

export function ImageOptionSelector({
  options,
  value,
  onChange,
  columns = 4
}: {
  options: { name: string, image?: string, color?: string }[],
  value: string,
  onChange: (v: string) => void,
  columns?: 3 | 4 | 5
}) {
  const colClass = columns === 3 ? "sm:grid-cols-3" : columns === 5 ? "sm:grid-cols-5" : "sm:grid-cols-4";

  return (
    <div className={cn("grid gap-3 grid-cols-2", colClass)}>
      {options.map((opt) => (
        <ImageOptionCard
          key={opt.name}
          name={opt.name}
          image={opt.image}
          color={opt.color}
          isSelected={value === opt.name}
          onClick={() => onChange(opt.name)}
        />
      ))}
    </div>
  );
}
