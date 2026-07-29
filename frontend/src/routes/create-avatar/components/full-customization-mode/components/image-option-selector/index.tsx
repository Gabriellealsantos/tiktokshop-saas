import { useState } from "react";
import { Check, Image as ImageIcon } from "lucide-react";
import { cn } from "@/utils/utils";

export function ImageOptionCard({ name, label, image, color, isSelected, onClick, aspectRatio = "aspect-[4/5]", objectFit = "object-cover", hideLabel = false }: { name: string, label?: string, image?: string, color?: string, isSelected: boolean, onClick: () => void, aspectRatio?: string, objectFit?: string, hideLabel?: boolean }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-[20px] text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        aspectRatio,
        isSelected
          ? "ring-2 ring-inset ring-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.4)]"
          : "ring-1 ring-inset ring-white/10 hover:ring-white/20 hover:-translate-y-1 hover:shadow-lg bg-surface-2"
      )}
    >
      {image && !imgError ? (
        <img src={image} alt={label || name} onError={() => setImgError(true)} className={cn("absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105", objectFit)} />
      ) : (
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-surface-3 text-text-3 transition-colors" style={color ? { background: color } : undefined}>
          <ImageIcon className="size-8 mb-4 opacity-30" />
        </div>
      )}
      {!hideLabel && (
        <>
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="font-bold text-white text-sm drop-shadow-md truncate">{label || name}</p>
          </div>
        </>
      )}
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
  columns = 4,
  aspectRatio = "aspect-[4/5]",
  objectFit = "object-cover",
  hideLabel = false,
  children
}: {
  options: { name: string, label?: string, image?: string, color?: string }[],
  value: string,
  onChange: (v: string) => void,
  columns?: 2 | 3 | 4 | 5,
  aspectRatio?: string,
  objectFit?: string,
  hideLabel?: boolean,
  children?: React.ReactNode
}) {
  const colClass = columns === 2 ? "sm:grid-cols-2" : columns === 3 ? "sm:grid-cols-3" : columns === 5 ? "sm:grid-cols-5" : "sm:grid-cols-4";

  return (
    <div className={cn("grid gap-3 grid-cols-2 p-2 -m-2", colClass)}>
      {options.map((opt) => (
        <ImageOptionCard
          key={opt.name}
          name={opt.name}
          label={opt.label}
          image={opt.image}
          color={opt.color}
          isSelected={value === opt.name}
          onClick={() => onChange(opt.name)}
          aspectRatio={aspectRatio}
          objectFit={objectFit}
          hideLabel={hideLabel}
        />
      ))}
      {children}
    </div>
  );
}
