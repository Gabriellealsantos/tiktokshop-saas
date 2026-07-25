import { ExternalLink } from "lucide-react";
import { cn } from "@/utils/utils";

export function ActionCardButton({
  icon: Icon,
  title,
  description,
  actionIcon: ActionIcon = ExternalLink,
  primary = false,
  onClick,
  disabled = false,
  spinning = false
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  description?: string;
  actionIcon?: React.ComponentType<{ className?: string }>;
  primary?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  spinning?: boolean;
}) {
  const themes = {
    secondary: {
      card: "btn-3d-neutral",
      chip: "bg-accent-500/15 text-accent-300",
      title: "!text-white",
      desc: "!text-white/60"
    },
    purple: {
      card: "btn-3d-primary text-white",
      chip: "bg-white/20 text-white",
      title: "text-white font-bold",
      desc: "text-white/80"
    }
  };

  const activeTheme = primary ? themes.purple : themes.secondary;

  return (
    <button
      type="button"
      className={cn(
        "group relative flex items-center gap-4 w-full p-4 rounded-[18px] text-left transition-all duration-200 motion-reduce:transform-none",
        activeTheme.card,
        disabled && "opacity-60 cursor-not-allowed pointer-events-none"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-[11px] transition-transform group-hover:scale-105", activeTheme.chip)}>
        <Icon className={cn("size-5", spinning && "animate-spin")} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn("text-[15px] sm:text-base tracking-tight mb-0.5 font-semibold truncate", activeTheme.title)}>
          {title}
        </div>
        {description && (
          <div className={cn("text-[13px] leading-snug truncate transition-colors", activeTheme.desc)}>
            {description}
          </div>
        )}
      </div>
      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-1", primary ? "bg-white/10 text-white" : "bg-black/20")}>
        <ActionIcon className={cn("size-4", primary ? "text-white" : "text-white/50 group-hover:text-white")} />
      </div>
    </button>
  );
}
