import { Sparkles } from "lucide-react";
import { cn } from "@/utils/utils";

export function TrendHeader({
  title,
  subtitle,
  description,
  eyebrow = "Inteligência viral",
  titleHighlight = "AI",
  compact = false,
}: {
  title: string;
  subtitle: string;
  description: string;
  eyebrow?: string;
  titleHighlight?: string;
  compact?: boolean;
}) {
  return (
    <header className={cn(
      "entrance relative z-10 flex flex-col mb-2",
      compact ? "items-start text-left max-w-xl" : "items-center text-center max-w-3xl mx-auto"
    )}>
      {/* Atmosphere Glow */}
      {!compact && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[150px] md:h-[250px] bg-brand-500/15 blur-[80px] md:blur-[120px] rounded-full pointer-events-none -z-10" />
      )}

      {/* Eyebrow Badge */}
      <div
        className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
        style={{
          background: "linear-gradient(135deg, rgba(106,99,242,0.18), rgba(59,51,222,0.12))",
          border: "1px solid rgba(140,134,247,0.32)",
          boxShadow: "0 0 18px rgba(75,68,232,0.25)",
        }}
      >
        <Sparkles className="size-3.5 text-brand-300" />
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-300">
          {eyebrow}
        </span>
      </div>

      {/* H1 */}
      <h1 className={cn(
        "mb-2 font-extrabold tracking-[-.03em] leading-[1.05] text-text-1",
        compact ? "text-3xl md:text-4xl" : "text-5xl md:text-6xl"
      )}>
        {title}{" "}
        {titleHighlight && (
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(120deg, var(--brand-300) 0%, var(--brand-400) 40%, var(--brand-500) 100%)",
            }}
          >
            {titleHighlight}
          </span>
        )}
      </h1>

      {/* Subtítulo */}
      <h2 className={cn(
        "mb-3 font-semibold text-text-1/80",
        compact ? "text-lg md:text-xl" : "text-xl md:text-2xl"
      )}>{subtitle}</h2>

      {/* Descrição */}
      {!compact && (
        <p className="max-w-lg mx-auto text-[15px] md:text-base leading-[1.6]" style={{ color: "#9B95B8" }}>
          {description}
        </p>
      )}
    </header>
  );
}
