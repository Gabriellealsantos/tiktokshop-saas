import { useEffect, useRef } from "react";
import { Play } from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Page, PageHeader } from "@/components/base/page";
import { AppShell } from "@/layouts/app-shell";
import { modelosPlaceholder } from "@/features/modelos/modelos-screen";

function PickerVideoCard({ modelo, productId }: { modelo: typeof modelosPlaceholder[0], productId?: string }) {
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
            videoRef.current.play().catch(() => {});
          } else {
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
    <button
      onClick={() => {
        navigate({ 
          to: "/modelos/usar", 
          search: { id: modelo.id, video: modelo.video, productId } 
        });
      }}
      className="group relative overflow-hidden rounded-[20px] bg-gradient-to-br from-surface-3 to-deep border border-white/5 transition-all hover:border-violet-500/50 hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(139,92,246,0.4)] focus-within:ring-2 focus-within:ring-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 aspect-[9/16] text-left w-full cursor-pointer block"
    >
      <video
        ref={videoRef}
        src={modelo.video}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        muted
        loop
        playsInline
        preload="metadata"
        onError={(e) => {
          (e.target as HTMLVideoElement).style.display = 'none';
          (e.target as HTMLVideoElement).nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className="hidden absolute inset-0 flex items-center justify-center text-white/20">
        <Play className="size-12" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity group-hover:from-black/95 group-hover:via-black/40" />
      
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col gap-3">
        <p className="font-bold text-white text-lg drop-shadow-md transition-transform group-hover:-translate-y-1">{modelo.name}</p>
      </div>
    </button>
  );
}

export function ProductModelsPicker() {
  const search: any = useSearch({ strict: false });
  const productId = search.productId;

  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="ADAPTAR MODELO"
          title="Escolha um modelo"
          description="Selecione um modelo viral para adaptar ao seu produto e gerar conteúdo em instantes."
        />
        
        <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {modelosPlaceholder.map((modelo) => (
            <PickerVideoCard key={modelo.id} modelo={modelo} productId={productId} />
          ))}
        </div>
      </Page>
    </AppShell>
  );
}
