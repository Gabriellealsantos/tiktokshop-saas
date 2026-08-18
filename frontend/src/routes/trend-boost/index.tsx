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
  category,
}: {
  id: string;
  title: string;
  text: string;
  videoSrc?: string | null;
  thumbnailSrc?: string | null;
  category?: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [thumbError, setThumbError] = useState(false);



  return (
    <Link
      to={`/trend-boost/${id}`}
      className="group relative overflow-hidden flex flex-col justify-end transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(109,91,245,0.3)] hover:ring-1 hover:ring-[var(--brand-purple)] aspect-[9/16] w-full max-h-[560px] rounded-[24px] mx-auto max-w-sm lg:max-w-none bg-zinc-900 cursor-pointer block"
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
          autoPlay
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
        <div className="absolute inset-0 bg-linear-to-br from-deep to-surface-3 flex flex-col items-center justify-center p-6 text-center z-0">
          <Play className="size-10 text-accent-400/50 mb-3" />
          <span className="text-text-3 text-sm">{title}</span>
        </div>
      )}

      {/* Inner Hover Glow */}
      <div className="absolute inset-0 bg-[var(--brand-purple)] opacity-0 blur-[60px] transition-opacity duration-500 group-hover:opacity-30 pointer-events-none z-10" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10 transition-opacity duration-500 group-hover:opacity-90" />

      <div className="absolute top-4 left-4 z-20">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90">
          <Play className="size-3" />
          {category?.trim() || "Template"}
        </div>
      </div>

      <div className="relative z-20 p-6 w-full flex flex-col gap-1 transition-transform duration-500 group-hover:-translate-y-2">
        <h2 className="text-xl font-bold text-white leading-tight">{title}</h2>
        <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed">{text}</p>
      </div>
    </Link>
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
      <Page className="pt-0 -mt-6 max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="rounded-[24px] bg-[#0F0D15]/20 backdrop-blur-3xl border border-white/5 py-5 px-6 mb-4">
          <TrendHeader
            title="Trend"
            titleHighlight="AI"
            subtitle=""
            description="Escolha uma estrutura feita para retenção, comentário e compartilhamento."
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-6 animate-spin text-brand-400" />
          </div>
        ) : !templates?.length ? (
          <div className="rounded-[24px] bg-[#0F0D15]/20 backdrop-blur-3xl border border-white/5 p-10 text-center">
            <p className="text-text-3">Nenhum template disponível no momento.</p>
          </div>
        ) : (
          <div className="rounded-[24px] bg-[#0F0D15]/20 backdrop-blur-3xl border border-white/5 p-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((t) => (
              <TrendTemplateCard
                key={t.slug}
                id={t.slug}
                title={t.title}
                text={t.description ?? t.subtitle ?? ""}
                videoSrc={t.previewVideoUrl}
                thumbnailSrc={t.thumbnailUrl}
                category={t.category}
              />
            ))}
            </div>
          </div>
        )}
      </Page>
    </AppShell>
  );
}
