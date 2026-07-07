import { useEffect, useRef } from "react";
import { Sparkles, Play } from "lucide-react";
import { Page, PageHeader } from "@/components/base/page";
import { AppShell } from "@/layouts/app-shell";
import { Button } from "@/components/base/primitives";

export const modelosPlaceholder = [
  { id: 1, name: "Novelinha Viral", video: "/c-criar-seu-video3.mp4" },
  { id: 2, name: "UGC Natural", video: "/placeholder-video.mp4" },
  { id: 3, name: "Review Dinâmico", video: "/placeholder-video.mp4" },
  { id: 4, name: "Estilo Vlog", video: "/placeholder-video.mp4" },
  { id: 5, name: "Transições Rápidas", video: "/placeholder-video.mp4" },
  { id: 6, name: "Storytelling", video: "/placeholder-video.mp4" },
];

import { useNavigate } from "@tanstack/react-router";

function VideoCard({ modelo }: { modelo: typeof modelosPlaceholder[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!videoRef.current) return;
          const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (prefersReducedMotion) {
            videoRef.current.pause();
            return;
          }

          if (entry.isIntersecting) {
            // Autoplay when entering viewport
            videoRef.current.play().catch(() => {
              // Ignore autoplay restrictions silently
            });
          } else {
            // Pause when leaving viewport to save resources
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.15 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="group relative overflow-hidden rounded-[20px] bg-gradient-to-br from-surface-3 to-deep border border-white/5 transition-all hover:border-white/10 hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(139,92,246,0.3)] focus-within:ring-2 focus-within:ring-violet-500/50 aspect-[9/16]">
      <video
        ref={videoRef}
        src={modelo.video}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        muted
        loop
        playsInline
        preload="metadata"
        // Fallback style if video fails to load
        onError={(e) => {
          (e.target as HTMLVideoElement).style.display = 'none';
          (e.target as HTMLVideoElement).nextElementSibling?.classList.remove('hidden');
        }}
      />
      {/* Fallback Icon when video fails */}
      <div className="hidden absolute inset-0 flex items-center justify-center text-white/20">
        <Play className="size-12" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col gap-3">
        <p className="font-bold text-white text-lg drop-shadow-md">{modelo.name}</p>
        
        <Button 
          className="w-full opacity-100 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 shadow-lg"
          onClick={() => {
            navigate({ to: "/modelos/usar", search: { id: modelo.id, video: modelo.video } });
          }}
        >
          <Sparkles className="size-4 mr-2" />
          Utilizar modelo
        </Button>
      </div>
    </div>
  );
}

export function ModelosScreen() {
  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="INTELIGÊNCIA VIRAL"
          title="Modelos"
          description="Modelos virais prontos para usar como base nos seus vídeos."
        />
        
        <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {modelosPlaceholder.map((modelo) => (
            <VideoCard key={modelo.id} modelo={modelo} />
          ))}
        </div>
      </Page>
    </AppShell>
  );
}
