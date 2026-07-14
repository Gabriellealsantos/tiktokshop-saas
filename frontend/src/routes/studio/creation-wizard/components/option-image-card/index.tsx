import { useState } from "react";
import { Check, Image as ImageIcon } from "lucide-react";
import { cn } from "@/utils/utils";
import { toSlug } from "../../data";

export function OptionImageCard({ title, selected, onClick, compact }: { title: string; selected: boolean; onClick: () => void; compact?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const slug = toSlug(title);
  const imageSrc = `/${slug}.png`;

  return (
    <div
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "glass-surface is-interactive group relative overflow-hidden rounded-[14px] cursor-pointer text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
        selected && "border-accent-400/50 shadow-[0_0_0_2px_rgba(139,124,255,.12),0_0_20px_-4px_rgba(109,91,245,0.4)]"
      )}
    >
      <div className={cn("w-full bg-deep relative", compact ? "aspect-[4/3]" : "aspect-[4/3]")}>
        {!imgError ? (
          <img
            src={imageSrc}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-surface-2 to-surface-3">
            <ImageIcon className="mb-2 size-6 text-text-3" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>
      <div className={cn("absolute bottom-0 inset-x-0 flex items-center justify-between bg-surface-2/80 backdrop-blur-md", compact ? "p-2" : "p-2.5")}>
        <span className={cn("font-semibold text-text-1", compact ? "text-[10px] sm:text-xs" : "text-xs")}>{title}</span>
      </div>
      {selected && (
        <span className={cn("brand-gradient accent-glow absolute right-2 top-2 grid place-items-center rounded-full", compact ? "size-5" : "size-6")}>
          <Check className={cn("text-primary-foreground", compact ? "size-3" : "size-3.5")} />
        </span>
      )}
    </div>
  );
}
