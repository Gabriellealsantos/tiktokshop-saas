import { useEffect, useRef, useState } from "react";
import { Sparkles, Play, Film, Upload } from "lucide-react";
import { Page, PageHeader, Button } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/utils/utils";

// TODO: preencher categoria de cada modelo
export const modelosPlaceholder = [
  { id: 1, name: "Novelinha Viral", video: "/c-criar-seu-video3.mp4", categoria: "Moda" },
  { id: 2, name: "UGC Natural", video: "/placeholder-video.mp4", categoria: "UGC" },
  { id: 3, name: "Review Dinâmico", video: "/placeholder-video.mp4", categoria: "Beleza" },
  { id: 4, name: "Estilo Vlog", video: "/placeholder-video.mp4", categoria: "Beleza" },
  { id: 5, name: "Transições Rápidas", video: "/placeholder-video.mp4", categoria: "Moda" },
  { id: 6, name: "Storytelling", video: "/placeholder-video.mp4", categoria: "UGC" },
];

const CATEGORIAS = ["Todos", "Moda", "UGC", "Beleza"];

export function SharedVideoCard({ modelo, isPicker, productId }: { modelo: typeof modelosPlaceholder[0], isPicker?: boolean, productId?: string }) {
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

    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    if (isPicker) {
      navigate({ to: "/templates/use", search: { id: modelo.id, video: modelo.video, productId } });
    }
  };

  return (
    <div 
      onClick={isPicker ? handleClick : undefined}
      role={isPicker ? "button" : undefined}
      tabIndex={isPicker ? 0 : undefined}
      onKeyDown={isPicker ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
      aria-label={modelo.name}
      className={cn(
        "group relative overflow-hidden rounded-[20px] bg-gradient-to-br from-surface-3 to-deep border border-white/5 transition-all focus-within:ring-2 focus-within:ring-brand-500/50 aspect-[9/16]",
        isPicker 
          ? "hover:border-brand-500/50 hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(75,68,232,0.4)] cursor-pointer block w-full text-left"
          : "hover:border-white/10 hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(139,92,246,0.3)]"
      )}
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

      {modelo.categoria && (
        <div className="absolute top-3 left-3 z-10 pointer-events-none rounded-full bg-[#0a0810]/50 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
          {modelo.categoria}
        </div>
      )}

      {!isPicker && (
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col gap-3">
          <Button 
            className="w-full opacity-100 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 shadow-lg"
            onClick={() => {
              navigate({ to: "/templates/use", search: { id: modelo.id, video: modelo.video, productId } });
            }}
          >
            <Sparkles className="size-4 mr-2" />
            Utilizar modelo
          </Button>
        </div>
      )}
    </div>
  );
}

export function SharedModelsView({ isPicker, productId }: { isPicker?: boolean, productId?: string }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  const modelosFiltrados = modelosPlaceholder.filter(
    m => categoriaAtiva === "Todos" || m.categoria === categoriaAtiva
  );

  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow={
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/15 border border-brand-500/20 text-brand-300 text-[11px] font-bold uppercase tracking-[.15em]">
              <Sparkles className="size-3.5" />
              Inteligência Viral
            </div>
          }
          title={
            <span className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
                <Film className="size-5" />
              </span>
              Extraia movimento de qualquer vídeo viral
            </span>
          }
          description="Escolha um modelo, a IA captura o melhor frame, troca a pessoa pelo seu avatar e gera um prompt pronto para usar em qualquer ferramenta de geração de vídeo."
        />
        
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div 
            className="flex flex-wrap items-center gap-2"
            role="radiogroup" 
            aria-label="Filtrar por categoria"
          >
            {CATEGORIAS.map(cat => {
              const ativo = categoriaAtiva === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  onClick={() => setCategoriaAtiva(cat)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    ativo
                      ? "btn-brand"
                      : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <Button 
            onClick={() => {
              // TODO: fluxo de upload manual de vídeo
              console.log("Upload manual click");
            }}
          >
            <Upload className="size-4 mr-2" />
            Upload manual
          </Button>
        </div>

        <div className="grid gap-2.5 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {modelosFiltrados.map((modelo) => (
            <SharedVideoCard key={modelo.id} modelo={modelo} isPicker={isPicker} productId={productId} />
          ))}
        </div>
      </Page>
    </AppShell>
  );
}

export function TemplatesScreen() {
  return <SharedModelsView />;
}
