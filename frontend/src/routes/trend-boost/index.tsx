import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/button";
import { Page } from "@/components/page";
import { AppShell } from "@/layouts/app-shell";
import { TrendHeader } from "./components/trend-header";
import { listViralTemplates } from "@/services/viralService";
import type { ViralTemplateSummary } from "@/models/viral";

function TrendTemplateCard({
  id,
  title,
  text,
  videoSrc,
  thumbnailSrc,
}: {
  id: string;
  title: string;
  text: string;
  videoSrc?: string | null;
  thumbnailSrc?: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [thumbError, setThumbError] = useState(false);

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
      {videoSrc && !videoError ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={thumbnailSrc ?? undefined}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoError(true)}
          aria-label={title}
        />
      ) : thumbnailSrc && !thumbError ? (
        <img
          src={thumbnailSrc}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          onError={() => setThumbError(true)}
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
        <Link to={`/trend-boost/${id}`}>
          <Button className="w-full">Usar Template</Button>
        </Link>
      </div>
    </div>
  );
}

export default function TrendLanding() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["viral-templates"],
    queryFn: async () => {
      const res = await listViralTemplates();
      return res.data as ViralTemplateSummary[];
    },
  });

  return (
    <AppShell>
      <Page className="pt-0">
        <TrendHeader
          title="Viralize"
          subtitle="Turbine seu Engajamento"
          description="Escolha uma estrutura feita para retenção, comentário e compartilhamento."
        />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-6 animate-spin text-brand-400" />
          </div>
        ) : !templates?.length ? (
          <p className="text-center text-text-3 py-20">Nenhum template disponível no momento.</p>
        ) : (
          <div className="max-w-4xl mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {templates.map((t) => (
              <TrendTemplateCard
                key={t.slug}
                id={t.slug}
                title={t.title}
                text={t.description ?? t.subtitle ?? ""}
                videoSrc={t.previewVideoUrl}
                thumbnailSrc={t.thumbnailUrl}
              />
            ))}
          </div>
        )}
      </Page>
    </AppShell>
  );
}
