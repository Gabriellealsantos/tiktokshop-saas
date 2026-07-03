import { Check, LoaderCircle, Radio, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Pill({
  children,
  active,
  tone = "neutral",
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  tone?: "neutral" | "success" | "live";
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "glass-surface is-interactive inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-accent-400/50 bg-accent-500/12 text-accent-300"
          : "text-text-2 hover:border-accent-400/40 hover:text-text-1",
        tone === "success" && "border-success/20 bg-success/10 text-success",
        tone === "live" && "border-danger/20 bg-danger/10 text-danger",
      )}
    >
      {(tone === "success" || tone === "live") && (
        <span
          className={cn("size-1.5 rounded-full bg-current", tone === "live" && "animate-pulse")}
        />
      )}
      {children}
    </Comp>
  );
}

export function SelectableCard({
  title,
  description,
  selected,
  onClick,
  icon: Icon,
  media,
  compact,
}: {
  title: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: LucideIcon;
  media?: ReactNode;
  compact?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "glass-surface is-interactive group relative w-full overflow-hidden text-left transition-all duration-200",
        compact ? "p-3" : "p-5",
        selected
          ? "border-accent-400/50 bg-accent-500/10 shadow-[0_0_0_1px_rgba(139,124,255,.12)]"
          : "hover:-translate-y-0.5 hover:border-white/10",
      )}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="brand-gradient accent-glow absolute right-3 top-3 grid size-6 place-items-center rounded-full"
        >
          <Check className="size-3.5 text-primary-foreground" />
        </motion.span>
      )}
      {media}
      {Icon && (
        <span
          className={cn(
            "mb-4 grid size-10 place-items-center rounded-xl bg-surface-3 text-text-2 transition-colors",
            selected && "text-accent-300",
          )}
        >
          <Icon className="size-5" />
        </span>
      )}
      <span className="block pr-7 text-sm font-semibold text-text-1">{title}</span>
      {description && (
        <span className="mt-1.5 block text-xs leading-5 text-text-2">{description}</span>
      )}
    </motion.button>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "accent" | "green";
  icon: LucideIcon;
}) {
  return (
    <div className="glass-surface is-data p-5 transition-colors hover:border-white/10">
      <div className="flex items-center justify-between text-text-2">
        <span className="text-[11px] font-semibold uppercase tracking-[.16em]">{label}</span>
        <Icon className="size-4" />
      </div>
      <div
        className={cn(
          "mt-5 text-3xl font-extrabold tracking-tight tabular-nums text-text-1",
          tone === "accent" && "text-accent-300",
          tone === "green" && "text-success",
        )}
      >
        {value}
      </div>
      {hint && <p className="mt-2 text-xs text-text-2">{hint}</p>}
    </div>
  );
}

export function LoadingScreen({
  title = "Lendo seu roteiro...",
  subtitle = "Preparando sua criação final",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="glass-surface mx-auto flex min-h-[420px] max-w-2xl flex-col items-center justify-center p-10 text-center">
      <div className="relative grid size-24 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full border border-accent-400/20" />
        <span className="absolute inset-3 rounded-full border border-accent-400/30 [animation:soft-pulse_1.8s_ease-in-out_infinite]" />
        <Sparkles className="size-8 text-accent-300" />
      </div>
      <h2 className="mt-7 text-2xl font-bold text-text-1">{title}</h2>
      <p className="mt-2 text-sm text-text-2">{subtitle}</p>
      <div className="mt-7 h-1.5 w-64 overflow-hidden rounded-full bg-surface-3">
        <motion.div
          initial={{ width: "4%" }}
          animate={{ width: "94%" }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="brand-gradient h-full rounded-full"
        />
      </div>
      <div className="mt-4 flex gap-1 text-accent-300">
        <Radio className="size-3 animate-pulse" />
        <LoaderCircle className="size-3 animate-spin" />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass-surface flex min-h-64 flex-col items-center justify-center border-dashed p-8 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-surface-3">
        <Sparkles className="size-5 text-text-2" />
      </div>
      <h3 className="font-semibold text-text-1">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-text-2">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export { Button };
