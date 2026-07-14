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
      card: "bg-white/5 border-white/10 hover:bg-white/10 hover:border-accent-500/35 hover:shadow-[0_8px_24px_-12px_rgba(139,92,246,0.15)]",
      chip: "bg-accent-500/15 text-accent-300",
      title: "!text-white",
      desc: "!text-white/60"
    },
    purple: {
      card: "bg-gradient-to-r from-accent-500 to-accent-600 border-none shadow-[0_12px_32px_-12px_rgba(139,92,246,0.5)] hover:from-accent-400 hover:to-accent-500 text-white",
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
        "group relative flex items-center gap-4 w-full p-4 rounded-[18px] border text-left transition-all duration-300 motion-reduce:transform-none backdrop-blur-md",
        primary ? cn(themes.purple.card, "hover:-translate-y-1") : cn("glass-surface hover:-translate-y-0.5", activeTheme.card),
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
