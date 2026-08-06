import { useRef, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  Film,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Page,
  PageHeader,
} from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { asset } from "@/lib/media";

function StudioModeCard({
  format,
  selected,
}: {
  format: {
    title: string;
    text: string;
    badge: string;
    videoSrc: string;
    id: string;
  };
  selected?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          if (entry.isIntersecting && !prefersReducedMotion) {
            videoRef.current?.play().catch(() => {});
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.5 },
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
      className={`group relative overflow-hidden rounded-2xl aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] border ${
        selected
          ? "border-violet-500 shadow-[0_0_0_2px_rgba(139,92,246,0.4)]"
          : "border-border/50"
      } hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] bg-card text-left flex flex-col justify-end w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2`}
      role="button"
      tabIndex={0}
    >
      <video
        ref={videoRef}
        src={format.videoSrc}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        muted={isMuted}
        loop
        playsInline
        preload="metadata"
      />
      {/* Fallback gradient if poster is missing or loading */}
      <div className="absolute inset-0 bg-linear-to-br from-accent-200/20 to-accent-300/20 -z-10" />

      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-t from-black/95 via-black/60 to-transparent pointer-events-none transition-all duration-300 group-hover:h-[60%] group-hover:from-black" />

      <div className="absolute top-4 left-4 z-10">
        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur-md rounded-full border border-white/10">
          {format.badge}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleMute}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          aria-label={isMuted ? "Ativar som" : "Desativar som"}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="relative z-10 p-5 md:p-6 lg:p-7 transition-transform duration-300 ease-out group-hover:-translate-y-1.5 motion-reduce:transform-none">
        <div className="w-7 h-[3px] rounded-full bg-violet-500 mb-3" />
        <h3 className="text-2xl md:text-[1.75rem] leading-tight font-bold tracking-tight text-white drop-shadow-md mb-2">
          {format.title}
        </h3>
        <p className="text-sm text-white/70 leading-relaxed line-clamp-2 max-w-[95%] mb-4">
          {format.text}
        </p>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
          Selecionar estilo{" "}
          <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-1 group-hover:text-violet-300 transition-all" />
        </div>
      </div>
    </motion.div>
  );
}

export default function StudioLanding() {
  const formats = [
    {
      id: "original",
      title: "Original (UGC)",
      text: "Avatar humanizado apresentando o produto com naturalidade.",
      icon: Camera,
      badge: "CRIATIVO UGC",
      videoSrc: asset("/c-criar-seu-video1.mp4"),
    },
    {
      id: "imersivo",
      title: "Imersivo (POV)",
      text: "Primeira pessoa, foco nas mãos, detalhes e produto.",
      icon: Video,
      badge: "POV IMERSIVO",
      videoSrc: asset("/c-criar-seu-video2.mp4"),
    },
    {
      id: "cinematografico",
      title: "Cinematográfico",
      text: "Interação, cenário, pose e movimento com direção visual.",
      icon: Film,
      badge: "CINEMATOGRÁFICO",
      videoSrc: asset("/c-criar-seu-video3.mp4"),
    },
  ];

  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Estúdio de criação"
          title={
            <>
              Escolha como criar{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-500 to-pink-500">
                seu vídeo
              </span>
            </>
          }
          description="Três linguagens de produção, um fluxo guiado até os ativos finais."
        />

        {/* Desktop Layout */}
        <div className="hidden lg:grid gap-8 grid-cols-3">
          {formats.map((format) => (
            <NavLink
              key={format.id}
              to={`/studio/${format.id}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl block"
            >
              {({ isActive }) => (
                <StudioModeCard format={format} selected={isActive} />
              )}
            </NavLink>
          ))}
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="block lg:hidden mt-4">
          <Carousel
            opts={{ align: "start", dragFree: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {formats.map((format) => (
                <CarouselItem
                  key={format.id}
                  className="pl-4 basis-[85%] sm:basis-[60%]"
                >
                  <NavLink
                    to={`/studio/${format.id}`}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl block h-full"
                  >
                    {({ isActive }) => (
                      <StudioModeCard format={format} selected={isActive} />
                    )}
                  </NavLink>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-6">
              <CarouselPrevious className="static translate-y-0 translate-x-0 bg-secondary/50 hover:bg-secondary border-border/50" />
              <CarouselNext className="static translate-y-0 translate-x-0 bg-secondary/50 hover:bg-secondary border-border/50" />
            </div>
          </Carousel>
        </div>
      </Page>
    </AppShell>
  );
}
