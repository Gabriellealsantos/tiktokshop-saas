import { useState, useRef, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Sparkles } from "lucide-react";
import { Button, Page } from "@/components";
import { AppShell } from "@/layouts/app-shell";
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
      "entrance relative z-10 flex flex-col mb-8",
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

function TrendTemplateCard({ id, title, text }: { id: string; title: string; text: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const videoMap: Record<string, string> = {
    novelinha: "/novelinha-viral.mp4",
    objetos: "/objetos-falantes.mp4",
  };
  const videoSrc = videoMap[id];

  const handleMouseEnter = () => {
    if (!videoRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  return (
    <div
      className="glass-surface group relative overflow-hidden flex flex-col justify-end transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:border-accent-400/50 aspect-[9/16] w-full max-h-[560px] rounded-[18px] mx-auto max-w-sm lg:max-w-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!videoError ? (
        <video
          ref={videoRef}
          src={videoSrc}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoError(true)}
          aria-label={title}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-deep to-surface-3 flex flex-col items-center justify-center p-6 text-center z-0">
          <Play className="size-10 text-accent-400/50 mb-3" />
          <span className="text-text-3 text-sm">{title}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,6,12,.92)] via-[rgba(8,6,12,.2)] to-transparent pointer-events-none z-10" />

      <div className="absolute top-4 left-4 z-20">
        <div className="glass-surface inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90">
          <Play className="size-3" />
          Template
        </div>
      </div>

      <div className="relative z-20 p-5 w-full">
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-sm text-white/60 mb-5 line-clamp-2">{text}</p>
        <Link to="/trend-boost/$template" params={{ template: id }}>
          <Button className="w-full">Usar Template</Button>
        </Link>
      </div>
    </div>
  );
}

export function TrendLanding() {
  const templates = [
    ["novelinha", "Novelinha Viral", "Histórias curtas com conflito, personagens e loop."],
    ["objetos", "Objetos Falantes", "Dicas memoráveis narradas pelo próprio objeto."],
  ] as const;

  return (
    <AppShell>
      <Page className="pt-0">
        <TrendHeader
          title="Viralize"
          subtitle="Turbine seu Engajamento"
          description="Escolha uma estrutura feita para retenção, comentário e compartilhamento."
        />
        <div className="max-w-4xl mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {templates.map(([id, title, text]) => (
            <TrendTemplateCard key={id} id={id} title={title} text={text} />
          ))}
        </div>
      </Page>
    </AppShell>
  );
}
