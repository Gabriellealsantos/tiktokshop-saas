import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Ban,
  Camera,
  Check,
  Copy,
  Crown,
  Download,
  ExternalLink,
  Film,
  Flame,
  Grid,
  Hand,
  Hash,
  Image as ImageIcon,
  Leaf,
  Moon,
  MousePointerClick,
  Move3d,
  Package,
  Palette,
  Play,
  RefreshCw,
  Shield,
  Shirt,
  Smile,
  Smartphone,
  Sparkles,
  Star,
  UserRound,
  Video,
  Volume2,
  VolumeX,
  Wind,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button, LoadingScreen, Pill, SelectableCard } from "@/components/base/primitives";
import { Page, PageHeader, SectionTitle } from "@/components/base/page";
import { ProductCard } from "@/components/cards/product-card";
import { AppShell } from "@/layouts/app-shell";
import { Stepper } from "@/components/navigation/stepper";
import {
  PromptResult,
  TakeEditor,
  TakesSelector,
  VoiceConfig,
} from "@/components/studio/studio-components";
import { avatars, products } from "@/mock/data";
import { cn } from "@/lib/utils";
import { scenarios, finalPrompt } from "@/lib/constants";

export const toSlug = (text: string) => {
  const map: Record<string, string> = {
    "De Frente": "de-frente",
    "Mais Próximo": "mais-proximo",
    "Corpo Completo": "corpo-completo",
    "Automático": "automatico",
    "Quarto": "quarto",
    "Estúdio": "estudio",
    "Ao ar livre": "ar-livre",
    "Academia": "academia",
    "Cozinha": "cozinha",
    "Escritório": "escritorio",
    "Banheiro": "banheiro",
    "Loja": "loja",
    "Natureza": "natureza",
    "Personalizado": "personalizado",
    "UGC Natural": "ugc-natural",
    "Hook TikTok": "hook-tiktok",
    "Mostrar o Produto": "mostrar-produto",
    "Review": "review",
    "Natural": "natural",
    "Mais Expressivo": "expressivo",
    "Mais Discreto": "discreto",
    "Traição": "traicao",
    "Drama Familiar": "drama-familiar",
    "Vida na Favela": "vida-na-favela",
    "Fofoca / Barraco": "fofoca",
    "Romance Proibido": "romance-proibido",
    "Vingança": "vinganca",
    "Superação": "superacao",
    "Mistério": "misterio",
    "Bancada de Mármore": "bancada-marmore",
    "Setup Gamer": "setup-gamer",
    "Mesa de Escritório": "mesa-escritorio",
    "Closet Maquiagem": "closet-maquiagem",
    "Unboxing Madeira": "umboxing-madeira",
    "De Lado": "de-lado",
    "Ângulo 3/4": "3-4",
    "Sentado(a)": "sentado",
    "Andando": "andando",
    "Maçã": "maca",
    "Tábua de Corte": "tabua-de-corte",
    "Xícara": "xicara"
  };
  return map[text] || text.toLowerCase().replace(/ /g, '-');
};

export function OptionImageCard({ title, imageSlug, selected, onClick, compact, fallbackColor, showFallbackIcon }: { title: string; imageSlug?: string; selected: boolean; onClick: () => void; compact?: boolean; fallbackColor?: string; showFallbackIcon?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const slug = imageSlug || toSlug(title);
  const imageSrc = `/${slug}.png`;

  useEffect(() => {
    setImgError(false);
  }, [imageSrc]);

  return (
    <div
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "glass-surface is-interactive group relative overflow-hidden rounded-[14px] cursor-pointer text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
        selected && "border-accent-400/50 shadow-[0_0_0_2px_rgba(139,124,255,.12),0_0_20px_-4px_rgba(109,91,245,0.4)]"
      )}
    >
      <div className={cn("w-full bg-deep relative", compact ? "aspect-[4/3]" : "aspect-[4/3]")}>
        {!imgError ? (
          <img
            src={imageSrc}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : fallbackColor ? (
          <div className="h-full w-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105" style={{ background: fallbackColor }}>
            {showFallbackIcon && <ImageIcon className="mb-2 size-6 text-white/50" />}
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-surface-2 to-surface-3">
            <ImageIcon className="mb-2 size-6 text-text-3" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>
      <div className={cn("absolute bottom-0 inset-x-0 flex items-center justify-between bg-surface-2/80 backdrop-blur-md", compact ? "p-2" : "p-2.5")}>
        <span className={cn("font-semibold text-text-1", compact ? "text-[10px] sm:text-xs" : "text-xs")}>{title}</span>
      </div>
      {selected && (
        <span className={cn("brand-gradient accent-glow absolute right-2 top-2 grid place-items-center rounded-full", compact ? "size-5" : "size-6")}>
          <Check className={cn("text-primary-foreground", compact ? "size-3" : "size-3.5")} />
        </span>
      )}
    </div>
  );
}

function StudioModeCard({ format, selected }: { format: { title: string; text: string; badge: string; videoSrc: string; poster: string; id: string }; selected?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (entry.isIntersecting && !prefersReducedMotion) {
            videoRef.current?.play().catch(() => { });
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.5 }
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
      className={`group relative overflow-hidden rounded-2xl aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] border ${selected ? "border-violet-500 shadow-[0_0_0_2px_rgba(139,92,246,0.4)]" : "border-border/50"
        } hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] bg-card text-left flex flex-col justify-end w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2`}
      role="button"
      tabIndex={0}
    >
      <video
        ref={videoRef}
        src={format.videoSrc}
        poster={format.poster}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        muted={isMuted}
        loop
        playsInline
        preload="metadata"
      />
      {/* Fallback gradient if poster is missing or loading */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-200/20 to-accent-300/20 -z-10" />

      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none transition-all duration-300 group-hover:h-[60%] group-hover:from-black" />

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
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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
          Selecionar estilo <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-1 group-hover:text-violet-300 transition-all" />
        </div>
      </div>
    </motion.div>
  );
}

export function StudioLanding() {
  const formats = [
    {
      id: "original",
      title: "Original (UGC)",
      text: "Avatar humanizado apresentando o produto com naturalidade.",
      icon: Camera,
      badge: "CRIATIVO UGC",
      videoSrc: "/c-criar-seu-video1.mp4",
      poster: "/videos/ugc-poster.jpg",
    },
    {
      id: "imersivo",
      title: "Imersivo (POV)",
      text: "Primeira pessoa, foco nas mãos, detalhes e produto.",
      icon: Video,
      badge: "POV IMERSIVO",
      videoSrc: "/c-criar-seu-video2.mp4",
      poster: "/videos/pov-poster.jpg",
    },
    {
      id: "cinematografico",
      title: "Cinematográfico",
      text: "Interação, cenário, pose e movimento com direção visual.",
      icon: Film,
      badge: "CINEMATOGRÁFICO",
      videoSrc: "/c-criar-seu-video3.mp4",
      poster: "/videos/cinema-poster.jpg",
    },
  ];
  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Estúdio de criação"
          title={
            <>
              Escolha como criar <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-500">seu vídeo</span>
            </>
          }
          description="Três linguagens de produção, um fluxo guiado até os ativos finais."
        />

        {/* Desktop Layout */}
        <div className="hidden lg:grid gap-8 grid-cols-3">
          {formats.map((format) => (
            <Link key={format.id} to="/estudio/$format" params={{ format: format.id }} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl block">
              {({ isActive }) => (
                <StudioModeCard format={format} selected={isActive} />
              )}
            </Link>
          ))}
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="block lg:hidden mt-4">
          <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {formats.map((format) => (
                <CarouselItem key={format.id} className="pl-4 basis-[85%] sm:basis-[60%]">
                  <Link to="/estudio/$format" params={{ format: format.id }} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl block h-full">
                    {({ isActive }) => (
                      <StudioModeCard format={format} selected={isActive} />
                    )}
                  </Link>
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

const configs = {
  original: {
    title: "Original (UGC)",
    steps: ["Produto", "Câmera & Influenciador", "Áudio & Roteiro", "Criação Final"],
  },
  imersivo: {
    title: "Imersivo (POV)",
    steps: ["Produto", "Configuração POV", "Áudio & Roteiro", "Criação Final"],
  },
  cinematografico: {
    title: "Cinematográfico",
    steps: [
      "Produto",
      "Influenciador Digital",
      "Cenário & Interação",
      "Movimento",
      "Criação Final",
    ],
  },
};

export function CreationWizard({ format }: { format: string }) {
  const key = format in configs ? (format as keyof typeof configs) : "original";
  const config = configs[key];
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [takes, setTakes] = useState(1);
  const [selected, setSelected] = useState(0);
  const advance = () => {
    if (step >= config.steps.length - 1) return;
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setStep((value) => value + 1);
    }, 950);
  };
  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Estúdio de criação"
          title={config.title}
          description="Configure cada detalhe e leve seus ativos para a ferramenta de vídeo."
        />
        <Stepper steps={config.steps} current={step} />
        {loading ? (
          <LoadingScreen
            title={
              step === config.steps.length - 2
                ? "Preparando seus ativos..."
                : "Salvando suas escolhas..."
            }
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && <ProductStep selected={selected} setSelected={setSelected} />}{" "}
              {step > 0 && step === config.steps.length - 1 && <CreationFinal takes={takes} />}
              {step > 0 &&
                step < config.steps.length - 1 &&
                (key === "original" ? (
                  <OriginalStep step={step} takes={takes} setTakes={setTakes} />
                ) : key === "imersivo" ? (
                  <PovStep step={step} takes={takes} setTakes={setTakes} />
                ) : (
                  <CinemaStep step={step} />
                ))}
            </motion.div>
          </AnimatePresence>
        )}{" "}
        {!loading && step < config.steps.length - 1 && (
          <div className="mt-7 flex justify-between">
            <Button variant="ghost" onClick={() => setStep((value) => Math.max(0, value - 1))}>
              Voltar
            </Button>
            <Button onClick={advance}>
              Continuar <Check />
            </Button>
          </div>
        )}
      </Page>
    </AppShell>
  );
}
function ProductStep({
  selected,
  setSelected,
}: {
  selected: number;
  setSelected: (value: number) => void;
}) {
  return (
    <div>
      <SectionTitle title="Escolha o produto" description="91 produtos validados disponíveis" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 8).map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            selected={selected === i}
            onClick={() => setSelected(i)}
          />
        ))}
      </div>
    </div>
  );
}
function AvatarGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {avatars.slice(0, 6).map((avatar, i) => (
        <SelectableCard
          key={avatar.id}
          selected={i === 0}
          title={avatar.name}
          description={avatar.gender}
          media={
            <img
              src={avatar.image}
              alt={avatar.name}
              className="mb-4 aspect-[4/3] w-full rounded-[14px] object-cover"
            />
          }
        />
      ))}
    </div>
  );
}
function Options({ title, items }: { title: string; items: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <div>
      <SectionTitle title={title} />
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" role="radiogroup">
        {items.map((item, i) => (
          <OptionImageCard
            key={item}
            title={item}
            selected={i === selectedIndex}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

export function OptionTextCard({ 
  title, 
  description, 
  icon: Icon, 
  selected, 
  onClick 
}: { 
  title: string; 
  description: string; 
  icon: any; 
  selected: boolean; 
  onClick: () => void; 
}) {
  return (
    <div
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "glass-surface is-interactive group relative rounded-[14px] p-[15px] cursor-pointer text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-accent-500 hover:-translate-y-0.5 flex flex-col gap-3",
        selected 
          ? "border-accent-400/50 shadow-[0_0_0_2px_rgba(139,124,255,.12),0_0_20px_-4px_rgba(109,91,245,0.4)]" 
          : "border-white/10 hover:border-white/20"
      )}
    >
      <div className="flex size-8 items-center justify-center rounded-[8px] bg-accent-500/15 text-accent-300">
        <Icon className="size-4" />
      </div>
      <div>
        <div className="font-semibold text-text-1 text-[13.5px] tracking-tight mb-0.5">{title}</div>
        <div className="text-[12.5px] text-white/55 line-clamp-1 leading-snug">{description}</div>
      </div>
      {selected && (
        <span className="brand-gradient accent-glow absolute right-3 top-3 grid place-items-center rounded-full size-5">
          <Check className="text-primary-foreground size-3" />
        </span>
      )}
    </div>
  );
}

function TextOptions({ title, items, columns = 4 }: { title: string; items: { title: string; description: string; icon: any }[], columns?: 3 | 4 }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <div>
      <SectionTitle title={title} />
      <div className={cn("grid gap-3 grid-cols-2", columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")} role="radiogroup">
        {items.map((item, i) => (
          <OptionTextCard
            key={item.title}
            title={item.title}
            description={item.description}
            icon={item.icon}
            selected={i === selectedIndex}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
function OriginalStep({
  step,
  takes,
  setTakes,
}: {
  step: number;
  takes: number;
  setTakes: (v: number) => void;
}) {
  return step === 1 ? (
    <div className="space-y-7">
      <Options
        title="Estilo de câmera"
        items={["De Frente", "Mais Próximo", "Corpo Completo", "Automático"]}
      />
      <SectionTitle
        title="Influenciador"
        description="Mulheres · Homens · Modelos IA · Meus Avatares"
      />
      <AvatarGrid />
      <Options title="Cenário" items={scenarios} />
      <TextOptions 
        title="Estilo do vídeo"
        columns={4}
        items={[
          { title: "UGC Natural", description: "Autêntico, como um usuário real gravaria.", icon: Smile },
          { title: "Hook TikTok", description: "Abertura de impacto nos primeiros segundos.", icon: Zap },
          { title: "Mostrar o Produto", description: "Foco na demonstração do produto.", icon: Package },
          { title: "Review", description: "Avaliação honesta com experiência de uso.", icon: Star },
        ]}
      />
      <TextOptions 
        title="Energia"
        columns={3}
        items={[
          { title: "Natural", description: "Tom equilibrado e espontâneo.", icon: Leaf },
          { title: "Mais Expressivo", description: "Animado, gestual e energético.", icon: Flame },
          { title: "Mais Discreto", description: "Calmo e sóbrio, sem exageros.", icon: Moon },
        ]}
      />
    </div>
  ) : (
    <AudioStep takes={takes} setTakes={setTakes} />
  );
}
function PovStep({
  step,
  takes,
  setTakes,
}: {
  step: number;
  takes: number;
  setTakes: (v: number) => void;
}) {
  return step === 1 ? (
    <div className="space-y-7">
      <Options
        title="Cenário POV"
        items={[
          "Bancada de Mármore",
          "Setup Gamer",
          "Mesa de Escritório",
          "Closet Maquiagem",
          "Unboxing Madeira",
          "Personalizado",
        ]}
      />
      <TextOptions 
        title="Aparência das mãos"
        columns={4}
        items={[
          { title: "Natural Feminina", description: "Mãos femininas, aparência natural.", icon: Hand },
          { title: "Natural Masculina", description: "Mãos masculinas, aparência natural.", icon: Hand },
          { title: "Luvas", description: "Mãos com luvas, visual limpo.", icon: Shield },
          { title: "Sem Mãos", description: "Foco total no produto, sem mãos.", icon: Ban },
        ]}
      />
      <TextOptions 
        title="Cor da mão"
        columns={3}
        items={[
          { title: "Clara", description: "Tom de pele claro.", icon: Palette },
          { title: "Morena", description: "Tom de pele intermediário.", icon: Palette },
          { title: "Escura", description: "Tom de pele escuro.", icon: Palette },
        ]}
      />
      <TextOptions 
        title="Apresentação"
        columns={4}
        items={[
          { title: "Textura", description: "Realça a textura do produto.", icon: Grid },
          { title: "Acabamento", description: "Destaca o acabamento e detalhes.", icon: Sparkles },
          { title: "Premium", description: "Visual sofisticado e premium.", icon: Crown },
          { title: "Demonstração", description: "Mostra o produto em uso.", icon: Play },
        ]}
      />
    </div>
  ) : (
    <AudioStep takes={takes} setTakes={setTakes} />
  );
}
function CinemaStep({ step }: { step: number }) {
  if (step === 1)
    return (
      <div>
        <SectionTitle
          title="Influenciador Digital"
          description="Influencer Studio · Meus Avatares"
        />
        <AvatarGrid />
      </div>
    );
  if (step === 2)
    return (
      <div className="space-y-7">
        <TextOptions 
          title="Interação"
          columns={4}
          items={[
            { title: "Vestindo o produto", description: "Creator usa o produto no corpo.", icon: Shirt },
            { title: "Segurando o produto", description: "Produto em destaque nas mãos.", icon: Hand },
            { title: "Selfie no espelho", description: "Gravação refletida no espelho.", icon: Smartphone },
            { title: "Selfie natural", description: "Enquadramento próximo e espontâneo.", icon: Camera },
          ]}
        />
        <Options title="Cenário" items={scenarios.slice(0, 8)} />
        <Options
          title="Pose"
          items={["De Frente", "De Lado", "Ângulo 3/4", "Sentado(a)", "Andando", "Personalizado"]}
        />
      </div>
    );
  return (
    <TextOptions
      title="Template de movimento"
      columns={3}
      items={[
        { title: "CTA", description: "Foco na chamada para ação final.", icon: MousePointerClick },
        { title: "Movimentos Naturais", description: "Câmera fluida e orgânica.", icon: Wind },
        { title: "Exibição de Produto", description: "Destaca o produto em rotação.", icon: RefreshCw },
      ]}
    />
  );
}
function AudioStep({ takes, setTakes }: { takes: number; setTakes: (v: number) => void }) {
  return (
    <div className="space-y-7">
      <div>
        <SectionTitle title="Duração por takes" />
        <TakesSelector value={takes} onChange={setTakes} />
      </div>
      <div>
        <SectionTitle title="Configuração de voz" />
        <VoiceConfig />
      </div>
      <div>
        <SectionTitle
          title="Fala por take"
          description="Até 20 palavras por take para melhor ritmo."
        />
        <TakeEditor count={takes} />
      </div>
    </div>
  );
}

function ActionCardButton({ 
  icon: Icon, 
  title,
  description,
  actionIcon: ActionIcon = ExternalLink,
  primary = false, 
  onClick, 
  disabled = false,
  spinning = false
}: { 
  icon: any; 
  title: React.ReactNode; 
  description?: string;
  actionIcon?: any;
  primary?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  spinning?: boolean;
}) {
  const themes = {
    secondary: {
      card: "bg-white/5 border-white/10 hover:bg-white/10 hover:border-accent-500/35 hover:shadow-[0_8px_24px_-12px_rgba(139,92,246,0.15)]",
      chip: "bg-accent-500/15 text-accent-300",
      title: "!text-white",
      desc: "!text-white/60"
    },
    purple: {
      card: "bg-gradient-to-r from-accent-500 to-accent-600 border-none shadow-[0_12px_32px_-12px_rgba(139,92,246,0.5)] hover:from-accent-400 hover:to-accent-500 text-white",
      chip: "bg-white/20 text-white",
      title: "text-white font-bold",
      desc: "text-white/80"
    }
  };

  const activeTheme = primary ? themes.purple : themes.secondary;

  return (
    <button 
      type="button"
      className={cn(
        "group relative flex items-center gap-4 w-full p-4 rounded-[18px] border text-left transition-all duration-300 motion-reduce:transform-none backdrop-blur-md",
        primary ? cn(themes.purple.card, "hover:-translate-y-1") : cn("glass-surface hover:-translate-y-0.5", activeTheme.card),
        disabled && "opacity-60 cursor-not-allowed pointer-events-none"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-[11px] transition-transform group-hover:scale-105", activeTheme.chip)}>
        <Icon className={cn("size-5", spinning && "animate-spin")} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn("text-[15px] sm:text-base tracking-tight mb-0.5 font-semibold truncate", activeTheme.title)}>
          {title}
        </div>
        {description && (
          <div className={cn("text-[13px] leading-snug truncate transition-colors", activeTheme.desc)}>
            {description}
          </div>
        )}
      </div>
      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-1", primary ? "bg-white/10 text-white" : "bg-black/20")}>
        <ActionIcon className={cn("size-4", primary ? "text-white" : "text-white/50 group-hover:text-white")} />
      </div>
    </button>
  );
}

function CreationFinal({ takes = 1 }: { takes?: number }) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGeneratePrompt = () => {
    if (hasGenerated) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 1200);
  };

  const cardBase = "glass-surface relative overflow-hidden rounded-[20px] border border-white/[0.08] border-t-white/[0.14] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_16px_48px_-12px_rgba(139,92,246,0.2)] hover:border-accent-500/30 motion-reduce:transform-none";

  const getAssetTheme = (type: string) => {
    switch (type) {
      case "Produto": return { badge: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: "text-amber-500" };
      case "Avatar": return { badge: "bg-accent-500/10 text-accent-300 border-accent-500/20", icon: "text-accent-400" };
      case "Cenário": return { badge: "bg-teal-500/10 text-teal-400 border-teal-500/20", icon: "text-teal-400" };
      default: return { badge: "bg-white/10 text-white border-white/20", icon: "text-white" };
    }
  };

  return (
    <div className="space-y-6">
      {/* MUDANÇA 1: Container Criação de Referência */}
      <div className={cn(cardBase, "p-6")}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-accent-500/10 text-accent-400">
              <ImageIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-1 tracking-tight">Criação de Referência</h2>
              <p className="text-sm text-text-2 mt-0.5">Gere a imagem base para o seu vídeo.</p>
            </div>
          </div>
          <Button className="bg-success hover:bg-success/80 text-black border-none font-semibold shadow-md gap-2 pl-2" onClick={() => {/* TODO: baixar todos os ativos */}}>
            <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-black/10">
              <Download className="size-4" />
            </div>
            Baixar Todos
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["PRODUTO", "Produto", Package, products[0].image],
            ["AVATAR", "Avatar", UserRound, avatars[0].image],
            ["CENÁRIO", "Cenário", ImageIcon, products[3].image],
          ].map(([badgeStr, title, Icon, image]) => {
            const theme = getAssetTheme(title as string);
            return (
              <div className="glass-surface relative overflow-hidden rounded-[16px] border border-white/[0.08] group hover:-translate-y-0.5 transition-all duration-300" key={title as string}>
                <div className="absolute top-3 left-3 z-10">
                  <div className={cn("px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider backdrop-blur-md", theme.badge)}>
                    {badgeStr as string}
                  </div>
                </div>
                
                {/* Ações individuais: Trocar e Baixar */}
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  <button type="button" onClick={() => {/* TODO: trocar ativo */}} className="flex size-8 items-center justify-center rounded-[9px] bg-black/40 text-white/80 border border-white/10 backdrop-blur-md transition-colors hover:bg-black/60 hover:text-white" title="Trocar ativo">
                    <RefreshCw className="size-4" />
                  </button>
                  <button type="button" onClick={() => {/* TODO: baixar ativo individual */}} className="flex size-8 items-center justify-center rounded-[9px] bg-black/40 text-white/80 border border-white/10 backdrop-blur-md transition-colors hover:bg-black/60 hover:text-white" title="Baixar ativo">
                    <Download className="size-4" />
                  </button>
                </div>
                
                <div className="aspect-[4/3] sm:aspect-video w-full overflow-hidden bg-surface-3">
                  <img
                    src={image as string}
                    alt={title as string}
                    className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                
                <div className="absolute bottom-0 inset-x-0 flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-white/10 backdrop-blur-md", theme.icon)}>
                      <Icon className="size-4" />
                    </div>
                    <span className="text-sm font-bold text-white drop-shadow-md">{title as string}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MUDANÇA 2: Mesclagem Colapsável */}
      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="mesclagem" className={cn(cardBase, "border-white/[0.08] data-[state=open]:pb-0")}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent" />
          
          <AccordionTrigger className="px-6 sm:px-7 py-6 hover:no-underline hover:bg-white/[0.02]">
            <div className="flex flex-1 items-center justify-between gap-4 mr-4">
              <div className="flex items-center gap-4 text-left">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-accent-400 to-accent-600 text-white shadow-lg">
                  <Flame className="size-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-text-1 tracking-tight">Mesclagem Manual</h2>
                  <p className="text-sm text-text-2 mt-0.5">Grok / VEO 3.1 · Prompts técnicos e sequência.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold tracking-widest shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                PRONTO
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="px-6 sm:px-7 pb-7 pt-2">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* COLUNA ESQUERDA */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-white/5 text-text-3">
                      <Copy className="size-3" />
                    </div>
                    <span className="text-sm font-semibold text-text-1">Prompt de Mesclagem</span>
                  </div>
                </div>
                <div className="relative flex-1 min-h-[180px] rounded-[16px] border border-white/5 bg-[rgba(0,0,0,0.28)] p-5 font-mono text-[13px] leading-relaxed text-white/80 shadow-inner overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <Button size="sm" variant="ghost" className="h-7 px-2.5 bg-accent-500/10 text-accent-400 hover:bg-accent-500/20 hover:text-accent-300 text-xs font-semibold rounded-[7px]" onClick={() => { if (finalPrompt) navigator.clipboard?.writeText(finalPrompt); setCopied(true); }}>
                      {copied ? <Check className="size-3.5 mr-1.5" /> : <Copy className="size-3.5 mr-1.5" />}
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                  </div>
                  <div className="pt-6">
                    {finalPrompt || "// TODO: fonte do prompt completo"}
                  </div>
                </div>
              </div>

              {/* COLUNA DIREITA */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:w-56 shrink-0">
                <div className="flex-1 flex flex-col gap-2.5">
                  <div className="relative aspect-video w-full overflow-hidden rounded-[14px] border border-white/10 bg-surface-3 group/img">
                    <img src={avatars[0].image} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105 opacity-90" alt="Avatar" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[14px]" />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-[#34d399] to-[#10b981] hover:from-[#10b981] hover:to-[#059669] text-black border-none font-bold shadow-md pl-1.5 gap-2 h-10 rounded-[12px]" onClick={() => {/* TODO: download avatar real */}}>
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-black/10">
                      <Download className="size-4" />
                    </div>
                    Baixar Avatar
                  </Button>
                </div>
                <div className="flex-1 flex flex-col gap-2.5">
                  <div className="relative aspect-video w-full overflow-hidden rounded-[14px] border border-white/10 bg-surface-3 group/img">
                    <img src={products[0].image} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105 opacity-90" alt="Produto" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[14px]" />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-[#34d399] to-[#10b981] hover:from-[#10b981] hover:to-[#059669] text-black border-none font-bold shadow-md pl-1.5 gap-2 h-10 rounded-[12px]" onClick={() => {/* TODO: download produto real */}}>
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-black/10">
                      <Download className="size-4" />
                    </div>
                    Baixar Produto
                  </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* MUDANÇA 3: Mover botões Abrir e Gerar Prompt */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionCardButton 
            icon={Play} 
            title="Abrir Flow VEO3" 
            description="Vídeos profissionais"
            onClick={() => {/* TODO: definir destino do VEO3 */}} 
          />
          <ActionCardButton 
            icon={ExternalLink} 
            title="Abrir Grok" 
            description="Roteiro e mesclagem"
            onClick={() => {/* TODO: definir destino do Grok */}} 
          />
        </div>
        <ActionCardButton 
          icon={isGenerating ? RefreshCw : Sparkles} 
          title={isGenerating ? "Gerando..." : hasGenerated ? "Regerar Prompt" : "Gerar Prompt"} 
          description="Storyboard técnico VEO 3.1 em segundos"
          actionIcon={ArrowRight}
          spinning={isGenerating}
          onClick={handleGeneratePrompt} 
          disabled={isGenerating}
        />
      </div>

      {/* MUDANÇA 4: "Gerar Prompt" revela a caixa do prompt gerado */}
      <AnimatePresence>
        {hasGenerated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-6 pt-4">
              {/* Seções Take - Prompt VEO 3.1 */}
              <Accordion type="multiple" defaultValue={Array.from({ length: takes }).map((_, i) => `take-${i}`)} className="space-y-4">
                {Array.from({ length: takes }).map((_, i) => (
                  <AccordionItem value={`take-${i}`} key={i} className={cn(cardBase, "border-white/[0.08] data-[state=open]:pb-0")}>
                    <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-white/[0.02]">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center px-3 py-1.5 rounded-[9px] bg-accent-500/15 text-accent-400 border border-accent-500/20 text-xs font-bold tracking-widest">
                          TAKE {i + 1}
                        </div>
                        <span className="text-base font-semibold text-text-1">Prompt VEO 3.1</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      <div className="space-y-5">
                        <div className="rounded-[14px] border border-white/5 bg-[rgba(0,0,0,0.2)] p-5 font-mono text-[13px] leading-relaxed text-white/80 shadow-inner">
                          {`// TODO: fonte do prompt gerado por take\n[MANDATORY GLOBAL INSTRUCTIONS]\n[CLEAN OUTPUT]\n[Roteiro/Prompt específico para este take]`}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-white/5 text-text-3">
                              <Check className="size-3" />
                            </div>
                            <h4 className="text-sm font-semibold text-text-1">Regras (Guardrails)</h4>
                          </div>
                          <ul className="list-disc list-inside text-sm text-text-2 space-y-2 ml-1">
                            <li>{`// TODO: texto das regras/enforcement`}</li>
                            <li>Não altere a identidade visual do avatar.</li>
                            <li>Mantenha o produto sempre em foco.</li>
                            <li>Siga o estilo selecionado rigorosamente.</li>
                          </ul>
                        </div>
                        
                        <div className="rounded-[14px] bg-red-500/10 border border-red-500/20 p-5 relative overflow-hidden">
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500/50" />
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-red-500/20 text-red-400">
                              <Flame className="size-4" />
                            </div>
                            <h4 className="text-xs font-bold text-red-400 tracking-wider">PRIORITY & ENFORCEMENT</h4>
                          </div>
                          <p className="text-[13px] text-red-300/80 leading-relaxed pl-10">
                            {`// TODO: texto das regras/enforcement`}<br/>
                            O cumprimento destas regras é mandatório para aprovação da mesclagem. A consistência visual entre takes deve ser estritamente mantida.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AJUSTE 2 - Hashtags sugeridas (sempre visíveis fora da animação do prompt) */}
      <div className={cn(cardBase, "p-6 sm:p-7")}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-white/5 text-text-3">
            <Hash className="size-4" />
          </div>
          <span className="text-sm font-bold text-text-1 uppercase tracking-widest">Hashtags Sugeridas</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {["#tiktokshop", "#achadinhos", "#viralizou", "#paravoce", "#reviewreal"].map((tag) => (
            <div key={tag} className="px-4 py-2 rounded-full border border-accent-500/30 bg-accent-500/15 text-[13px] font-semibold text-accent-300 hover:bg-accent-500/25 hover:border-accent-500/50 transition-colors cursor-pointer">
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
