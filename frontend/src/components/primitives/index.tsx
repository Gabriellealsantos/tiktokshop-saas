import { ArrowDownRight, ArrowUpRight, Check, LoaderCircle, Radio, Sparkles } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/utils";

export function Pill({
  children,
  active,
  tone = "neutral",
  onClick,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  tone?: "neutral" | "success" | "live";
  onClick?: () => void;
  className?: string;
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
        className
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

const metricCardVariants = cva("transition-all", {
  variants: {
    surface: {
      default: "glass-surface is-data p-5 hover:border-white/10",
      elevated: "relative overflow-hidden rounded-2xl p-5 min-h-[140px] flex flex-col justify-between bg-[#1c1b26]/20 backdrop-blur-md border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.25),0_8px_20px_-10px_rgba(0,0,0,0.5)] duration-200 hover:bg-[#1c1b26]/30 hover:border-white/[0.18] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.3),0_12px_26px_-8px_rgba(0,0,0,0.7)]",
    },
    emphasis: {
      default: "",
      primary: "border-dash-accent/30",
    },
  },
  defaultVariants: {
    surface: "default",
    emphasis: "default",
  },
});

const metricLabelVariants = cva("uppercase font-medium", {
  variants: {
    surface: {
      default: "text-[11px] font-semibold tracking-[.16em] text-text-2",
      elevated: "text-[11px] tracking-[0.14em] text-white/50",
    },
  },
  defaultVariants: {
    surface: "default",
  },
});

const metricValueVariants = cva("tracking-tight", {
  variants: {
    surface: {
      default: "mt-5 text-3xl font-extrabold tabular-nums text-text-1",
      elevated: "text-[32px] leading-none font-semibold [font-variant-numeric:tabular-nums_slashed-zero] text-white",
    },
  },
  defaultVariants: {
    surface: "default",
  },
});

export interface MetricCardProps extends VariantProps<typeof metricCardVariants> {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "negative" | "green" | "danger" | "success" | "red" | "accent";
  icon: LucideIcon;
}

export function MetricCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon: Icon,
  surface,
  emphasis,
}: MetricCardProps) {
  const isDefault = surface === "default" || !surface;

  return (
    <div className={metricCardVariants({ surface, emphasis })}>
      {!isDefault && emphasis === "primary" && (
        <div className="absolute -left-20 -top-20 size-56 rounded-full bg-dash-accent/20 blur-3xl pointer-events-none" />
      )}
      <div className={cn("relative z-10 flex items-center justify-between", isDefault && "text-text-2")}>
        <span className={metricLabelVariants({ surface })}>{label}</span>
        <div className={cn(
          isDefault ? "" : "grid size-8 place-items-center rounded-lg bg-dash-accent/12 text-dash-accent ring-1 ring-inset ring-dash-accent/20",
          !isDefault && emphasis === "primary" ? "bg-dash-accent/20" : ""
        )}>
          <Icon className="size-4" />
        </div>
      </div>
      <div
        className={cn(
          "relative z-10",
          metricValueVariants({ surface }),
          isDefault && tone === "accent" && "text-accent-300",
          isDefault && tone === "green" && "text-success",
          !isDefault && emphasis === "primary" && "text-dash-accent"
        )}
      >
        {value}
      </div>
      {hint && (
        <div className={cn("relative z-10 flex items-center", isDefault ? "mt-2" : "")}>
          {isDefault ? (
            <span className="text-xs text-text-2">{hint}</span>
          ) : tone === "positive" || tone === "green" || tone === "success" ? (
            <span className="inline-flex w-fit items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success">
              <ArrowUpRight className="size-3" />
              {hint}
            </span>
          ) : tone === "negative" || tone === "danger" || tone === "red" ? (
            <span className="inline-flex w-fit items-center gap-1 rounded-md bg-danger/10 px-2 py-1 text-xs font-medium text-danger">
              <ArrowDownRight className="size-3" />
              {hint}
            </span>
          ) : (
            <span className="inline-flex w-fit items-center gap-1 rounded-md bg-white/6 px-2 py-1 text-xs font-medium text-white/60">
              {hint}
            </span>
          )}
        </div>
      )}
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
    <div className="glass-surface mx-auto flex min-h-105 max-w-2xl flex-col items-center justify-center p-10 text-center">
      <div className="relative grid size-24 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full border border-accent-400/20" />
        <span className="absolute inset-3 rounded-full border border-accent-400/30 animate-[soft-pulse_1.8s_ease-in-out_infinite]" />
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
