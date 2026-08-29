import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, Play, Film, Settings, Loader2, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Page, PageHeader } from "./page";
import { Button } from "./button";
import { AppShell } from "@/layouts/app-shell";
import { cn } from "@/utils/utils";
import { useAuth } from "@/context/auth";
import { listVideoTemplates } from "@/services/videoTemplateService";
import type { VideoTemplateSummary } from "@/models/videoTemplate";

const CATEGORIAS = ["Todos", "Moda", "UGC", "Beleza"];
const PAGE_SIZE = 20;

export function SharedVideoCard({ modelo, productId, userProductId }: { modelo: VideoTemplateSummary; isPicker?: boolean; productId?: string; userProductId?: string }) {
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

  const goToAssembly = () => {
    const params = new URLSearchParams();
    params.set("slug", modelo.slug);
    params.set("video", modelo.videoUrl);
    if (modelo.thumbnailUrl) params.set("thumbnail", modelo.thumbnailUrl);
    if (productId) params.set("productId", productId);
    // Produto próprio do usuário: id de outro espaço, vai no parâmetro dele.
    if (userProductId) params.set("userProductId", userProductId);
    navigate(`/templates/use?${params.toString()}`);
  };

  const handleClick = () => {
    goToAssembly();
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={modelo.title}
      className="group relative overflow-hidden rounded-[22px] bg-linear-to-br from-surface-3 to-deep border border-white/10 transition-all duration-500 focus-within:ring-2 focus-within:ring-brand-500/50 aspect-[9/16] cursor-pointer block w-full text-left hover:border-brand-400 hover:-translate-y-2 hover:shadow-[0_0_35px_-4px_rgba(75,68,232,0.8),inset_0_0_25px_0_rgba(139,92,246,0.35)]"
    >
      <video
        ref={videoRef}
        src={modelo.videoUrl}
        poster={modelo.thumbnailUrl ?? undefined}
        // Mesma URL é capturada via <canvas> em /templates/use. Sem crossOrigin aqui,
        // o navegador cacheia a resposta em modo "no-cors" (sem headers CORS) e reusa
        // essa cópia lá, "taintando" o canvas. Manter os dois loads em modo CORS.
        crossOrigin="anonymous"
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

      {modelo.category && (
        <div className="absolute top-3 left-3 z-10 pointer-events-none rounded-full bg-[#0a0810]/60 backdrop-blur-md border border-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm transition-opacity duration-300 group-hover:opacity-0">
          {modelo.category}
        </div>
      )}

      {modelo.owned && (
        <div className="absolute top-3 right-3 z-10 pointer-events-none inline-flex items-center gap-1 rounded-full bg-brand-500/75 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm transition-opacity duration-300 group-hover:opacity-0">
          <UserRound className="size-3" />
          Seu vídeo
        </div>
      )}

      {modelo.duration && (
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none rounded-full bg-brand-500/80 backdrop-blur-md border border-brand-400/30 px-3 py-1 text-[10px] font-bold tracking-widest text-white shadow-[0_0_12px_-2px_rgba(139,92,246,0.5)] transition-opacity duration-300 group-hover:opacity-0">
          {modelo.duration}s
        </div>
      )}

      {/* Efeito Roxo Estilizado no Hover sem ícone central */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(75,68,232,0.15)_0%,rgba(75,68,232,0.25)_50%,rgba(75,68,232,0.55)_100%)] opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none z-20" />
    </div>
  );
}

export function SharedModelsView({ isPicker, productId, userProductId }: { isPicker?: boolean, productId?: string, userProductId?: string }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [templates, setTemplates] = useState<VideoTemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (pageToLoad: number, append: boolean) => {
    if (!append) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const res = await listVideoTemplates({
        category: categoriaAtiva === "Todos" ? undefined : categoriaAtiva,
        page: pageToLoad,
        size: PAGE_SIZE,
      });
      const content = (res.data?.content ?? []) as VideoTemplateSummary[];
      setTemplates((prev) => (append ? [...prev, ...content] : content));
      setHasMore(!res.data?.last);
    } catch {
      if (!append) setTemplates([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categoriaAtiva]);

  // Reset pagination and reload when category changes
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    load(0, false);
  }, [load]);

  // Load more when page increments
  useEffect(() => {
    if (page > 0) {
      load(page, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Estado mutável para o observer (evita recriar e causar loop infinito)
  const observerState = useRef({ hasMore, loading, loadingMore });
  useEffect(() => {
    observerState.current = { hasMore, loading, loadingMore };
  }, [hasMore, loading, loadingMore]);

  const observer = useRef<IntersectionObserver | null>(null);

  const setSentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) {
      observer.current.disconnect();
    }
    if (node) {
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            const state = observerState.current;
            if (state.hasMore && !state.loading && !state.loadingMore) {
              setPage((prev) => prev + 1);
            }
          }
        },
        { rootMargin: "200px" }
      );
      observer.current.observe(node);
    }
  }, []);

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
              Replique movimentos de qualquer vídeo viral
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

          {isAdmin && (
            <Button variant="outline" onClick={() => navigate("/admin")}>
              <Settings className="size-4 mr-2" />
              Gerenciar no Admin
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-6 animate-spin text-brand-400" />
          </div>
        ) : templates.length === 0 ? (
          <p className="text-center text-text-3 py-20">Nenhum modelo disponível nesta categoria.</p>
        ) : (
          <>
            <div className="grid gap-2.5 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {templates.map((modelo) => (
                <SharedVideoCard key={modelo.slug} modelo={modelo} isPicker={isPicker} productId={productId} userProductId={userProductId} />
              ))}
            </div>

            {/* Sentinel para infinite scroll */}
            {hasMore && (
              <div ref={setSentinelRef} className="flex justify-center py-8">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-sm text-text-3">
                    <Loader2 className="size-4 animate-spin" /> Carregando mais…
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Page>
    </AppShell>
  );
}

