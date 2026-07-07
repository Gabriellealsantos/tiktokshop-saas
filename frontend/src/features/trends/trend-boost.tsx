import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Drama, Flame, MessageCircleMore, Plus, Sparkles, Play, Apple, CookingPot, Upload, X, VenetianMask, GraduationCap, AlertTriangle, Smile, Archive, ShieldCheck, Lightbulb, CircleCheck } from "lucide-react";
import { motion } from "motion/react";
import { Button, LoadingScreen, SelectableCard } from "@/components/base/primitives";
import { Page, PageHeader, SectionTitle } from "@/components/base/page";
import { AppShell } from "@/layouts/app-shell";
import { Stepper } from "@/components/navigation/stepper";
import {
  PromptResult,
  TakeEditor,
  TakesSelector,
  VoiceConfig,
} from "@/components/studio/studio-components";
import { TextArea } from "@/components/base/form-controls";
import { scenarios } from "@/lib/constants";
import { OptionImageCard, OptionTextCard } from "@/features/creation/creation-studio";
import { cn } from "@/lib/utils";

function TrendTemplateCard({ id, title, text }: { id: string; title: string; text: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const videoMap: Record<string, string> = {
    novelinha: "/novelinha-viral.mp4",
    objetos: "/objetos-falantes.mp4",
    polemicas: "/polemicas-curiosidades.mp4"
  };
  const videoSrc = videoMap[id];

  const handleMouseEnter = () => {
    if (!videoRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion) {
      videoRef.current.play().catch(() => { });
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
    ["polemicas", "Polêmicas / Curiosidades", "Hooks fortes com tensão e revelação."],
  ] as const;

  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Inteligência viral"
          title="Turbine seu Engajamento"
          description="Escolha uma estrutura feita para retenção, comentário e compartilhamento."
        />
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(([id, title, text]) => (
            <TrendTemplateCard key={id} id={id} title={title} text={text} />
          ))}
        </div>
      </Page>
    </AppShell>
  );
}

const settings = {
  novelinha: { title: "Novelinha Viral", steps: ["Ideia", "Personagens", "Resultado"] },
  objetos: {
    title: "Objetos Falantes",
    steps: ["Objeto", "Estilo", "Conteúdo", "Revisão", "Resultado"],
  },
  polemicas: {
    title: "Polêmicas / Curiosidades",
    steps: ["Tipo de viral", "Gancho", "Intensidade", "Estrutura", "Resultado"],
  },
};
export function TrendWizard({ template }: { template: string }) {
  const key = template in settings ? (template as keyof typeof settings) : "novelinha";
  const cfg = settings[key];
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [takes, setTakes] = useState(3);
  const next = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setStep((v) => Math.min(v + 1, cfg.steps.length - 1));
    }, 900);
  };
  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Trend Boost"
          title={cfg.title}
          description="Estrutura guiada com resultado pronto para produção."
        />
        <Stepper steps={cfg.steps} current={step} />
        {loading ? (
          <LoadingScreen title="Construindo sua ideia viral..." />
        ) : (
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
            {step === cfg.steps.length - 1 ? (
              <PromptResult
                title={key === "objetos" ? "Prompts gerados para VEO3" : "Estrutura viral pronta"}
                objectMode={key === "objetos"}
              />
            ) : (
              <TrendStep kind={key} step={step} takes={takes} setTakes={setTakes} />
            )}
          </motion.div>
        )}
        {!loading && step < cfg.steps.length - 1 && (
          <div className="mt-7 flex justify-between">
            <Button variant="ghost" onClick={() => setStep((v) => Math.max(0, v - 1))}>
              Voltar
            </Button>
            <Button onClick={next}>
              <Sparkles />
              Gerar e continuar
            </Button>
          </div>
        )}
      </Page>
    </AppShell>
  );
}
function Grid({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <SectionTitle title={title} />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <SelectableCard key={item} compact title={item} selected={i === 0} />
        ))}
      </div>
    </div>
  );
}
function TipoHistoriaGrid() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const items = [
    "Traição",
    "Drama Familiar",
    "Vida na Favela",
    "Fofoca / Barraco",
    "Romance Proibido",
    "Vingança",
    "Superação",
    "Mistério",
    "Personalizado",
  ];
  return (
    <div>
      <SectionTitle title="Tipo de história" />
      <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" role="radiogroup">
        {items.map((item, i) => (
          <OptionImageCard
            key={item}
            title={item}
            selected={i === selectedIndex}
            onClick={() => setSelectedIndex(i)}
            compact
          />
        ))}
      </div>
    </div>
  );
}

function GlassCard({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
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
          onClick?.();
        }
      }}
      className={cn(
        "glass-surface is-interactive group relative w-full cursor-pointer overflow-hidden rounded-[14px] p-4 text-left transition-all duration-300 outline-none hover:-translate-y-0.5",
        selected
          ? "border-accent-400/50 bg-accent-500/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_16px_40px_-14px_rgba(0,0,0,0.5),0_0_0_2px_rgba(139,124,255,0.12),0_0_20px_-4px_rgba(109,91,245,0.4)]"
          : "hover:border-white/20"
      )}
    >
      <span className="block pr-6 text-sm font-semibold text-text-1">{title}</span>
      {description && (
        <span className="mt-1 block text-[11px] leading-snug text-text-2 opacity-70">{description}</span>
      )}
      {selected && (
        <span className="brand-gradient accent-glow absolute right-4 top-1/2 -translate-y-1/2 grid size-5 place-items-center rounded-full shadow-sm">
          <Check className="size-3 text-primary-foreground" />
        </span>
      )}
    </div>
  );
}

function GlassPillGrid({ title, items }: { title: string; items: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <div>
      <SectionTitle title={title} />
      <div className="flex flex-wrap gap-2.5" role="radiogroup">
        {items.map((item, i) => {
          const selected = i === selectedIndex;
          return (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "glass-surface is-interactive inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-300 outline-none hover:-translate-y-0.5",
                selected
                  ? "border-accent-400/50 bg-accent-500/10 text-text-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_10px_26px_-12px_rgba(0,0,0,0.55),0_0_0_2px_rgba(139,124,255,0.12),0_0_16px_-4px_rgba(109,91,245,0.4)]"
                  : "text-text-2 hover:border-white/20 hover:text-text-1"
              )}
            >
              {item}
              {selected && (
                <span className="brand-gradient accent-glow ml-0.5 grid size-4 place-items-center rounded-full shadow-sm">
                  <Check className="size-2.5 text-primary-foreground" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrendTakesSelector({
  value,
  onChange,
  options = [
    { takes: 3, seconds: 24 },
    { takes: 5, seconds: 40 },
    { takes: 7, seconds: 56 },
    { takes: 10, seconds: 80 },
  ],
}: {
  value: number;
  onChange: (value: number) => void;
  options?: { takes: number; seconds: number }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {options.map((option) => (
        <GlassCard
          key={option.takes}
          title={`${option.takes} takes`}
          description={`${option.seconds}s de vídeo`}
          selected={value === option.takes}
          onClick={() => onChange(option.takes)}
        />
      ))}
    </div>
  );
}

function CategoriaGrid({ title, items, value, onChange }: { title: string; items: string[]; value: number; onChange: (v: number) => void }) {
  const getIcon = (item: string) => {
    if (item === "Alimentos & Frutas") return <Apple className="size-5" />;
    if (item === "Utensílios de Cozinha") return <CookingPot className="size-5" />;
    return <Sparkles className="size-5" />;
  };

  return (
    <div>
      <SectionTitle title={title} />
      <div className="grid gap-3 sm:grid-cols-3" role="radiogroup">
        {items.map((item, i) => {
          const selected = i === value;
          return (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(i)}
              className={cn(
                "glass-surface is-interactive group relative flex w-full items-center gap-3 overflow-hidden rounded-[14px] p-3 text-left transition-all duration-300 outline-none hover:-translate-y-0.5",
                selected
                  ? "border-accent-400/50 bg-accent-500/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_16px_40px_-14px_rgba(0,0,0,0.5),0_0_0_2px_rgba(139,124,255,0.12),0_0_20px_-4px_rgba(109,91,245,0.4)]"
                  : "hover:border-white/20"
              )}
            >
              <div className={cn(
                "flex size-10 flex-none items-center justify-center rounded-xl transition-colors",
                selected ? "bg-accent-500/15 text-accent-300" : "bg-surface-3 text-text-2 group-hover:text-text-1"
              )}>
                {getIcon(item)}
              </div>
              <span className="font-semibold text-text-1 text-sm">{item}</span>
              {selected && (
                <span className="brand-gradient accent-glow absolute right-4 top-1/2 -translate-y-1/2 grid size-5 place-items-center rounded-full shadow-sm">
                  <Check className="size-3 text-primary-foreground" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ObjetoImageGrid({ title, items, value, onChange }: { title: string; items: string[]; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <SectionTitle title={title} />
      <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" role="radiogroup">
        {items.map((item, i) => (
          <OptionImageCard
            key={item}
            title={item}
            selected={i === value}
            onClick={() => onChange(i)}
            compact
          />
        ))}
        {/* Outro(a) option */}
        <div
          onClick={() => onChange(items.length)}
          role="radio"
          aria-checked={items.length === value}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onChange(items.length);
            }
          }}
          className={cn(
            "glass-surface is-interactive group relative overflow-hidden rounded-[14px] cursor-pointer text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-accent-500 border-dashed border-2",
            items.length === value 
              ? "border-accent-400/50 shadow-[0_0_0_2px_rgba(139,124,255,.12),0_0_20px_-4px_rgba(109,91,245,0.4)] border-solid" 
              : "border-accent-500/30 hover:border-accent-400/50 hover:-translate-y-0.5"
          )}
        >
          <div className={cn("w-full bg-accent-500/10 relative flex flex-col items-center justify-center aspect-[4/3]")}>
             <Plus className="mb-2 size-6 text-accent-300 opacity-80" />
             <span className="font-semibold text-accent-300 text-[10px] sm:text-xs">Outro(a)</span>
          </div>
          {items.length === value && (
             <span className="brand-gradient accent-glow absolute right-2 top-2 grid size-4 place-items-center rounded-full z-10 shadow-sm">
               <Check className="size-2.5 text-primary-foreground" />
             </span>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadObjetoCard() {
  const [preview, setPreview] = useState<string | null>(null);
  
  return (
    <div>
      <SectionTitle title="Adicione sua imagem" />
      {!preview ? (
        <label className="glass-surface group relative flex cursor-pointer flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-accent-500/30 p-10 text-center transition-all hover:border-accent-400/50 hover:bg-white/5">
          <Upload className="mb-4 size-10 text-accent-300 opacity-80 group-hover:scale-110 transition-transform" />
          <h4 className="font-semibold text-text-1">Arraste e solte aqui ou clique para enviar</h4>
          <p className="mt-2 text-xs text-text-3">PNG, JPG (Máx. 5MB)</p>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={(e) => {
               if (e.target.files?.[0]) {
                 setPreview(URL.createObjectURL(e.target.files[0]));
                 // TODO: persistir/enviar imagem do objeto personalizado
               }
            }}
          />
        </label>
      ) : (
        <div className="glass-surface relative overflow-hidden rounded-[14px] border border-accent-400/50 p-2">
          <img src={preview} alt="Objeto personalizado" className="h-64 w-full object-contain rounded-lg bg-black/20" />
          <button 
            onClick={() => setPreview(null)}
            className="absolute right-4 top-4 glass-surface flex size-8 items-center justify-center rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-text-1"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function TomDeFalaGrid({ title, items }: { title: string; items: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const getTomConfig = (item: string) => {
    switch (item) {
      case "Irritado / Revoltado":
        return { desc: "Tom nervoso e reclamão.", icon: Flame };
      case "Sarcástico":
        return { desc: "Ironia afiada e debochada.", icon: VenetianMask };
      case "Professoral / Sábio":
        return { desc: "Explica com calma e autoridade.", icon: GraduationCap };
      case "Desesperado":
        return { desc: "Aflito, pedindo socorro.", icon: AlertTriangle };
      case "Dramático":
        return { desc: "Exagerado e teatral.", icon: Drama };
      case "Amigável":
        return { desc: "Simpático e acolhedor.", icon: Smile };
      default:
        return { desc: "Tom padrão.", icon: Sparkles };
    }
  };

  return (
    <div>
      <SectionTitle title={title} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item, i) => {
          const config = getTomConfig(item);
          return (
            <OptionTextCard
              key={item}
              title={item}
              description={config.desc}
              icon={config.icon}
              selected={i === selectedIndex}
              onClick={() => setSelectedIndex(i)}
            />
          );
        })}
      </div>
    </div>
  );
}

function TipoDeDicaGrid({ title, items }: { title: string; items: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const getDicaConfig = (item: string) => {
    switch (item) {
      case "Armazenamento":
        return { desc: "Como guardar da forma certa.", icon: Archive };
      case "Erros Comuns":
        return { desc: "O que evitar no dia a dia.", icon: AlertTriangle };
      case "Conservação":
        return { desc: "Dura mais e melhor.", icon: ShieldCheck };
      case "Curiosidade":
        return { desc: "Fato surpreendente e viral.", icon: Lightbulb };
      case "Uso Correto":
        return { desc: "A maneira certa de usar.", icon: CircleCheck };
      case "Limpeza":
        return { desc: "Como limpar sem estragar.", icon: Sparkles };
      default:
        return { desc: "Dica padrão.", icon: Sparkles };
    }
  };

  return (
    <div>
      <SectionTitle title={title} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item, i) => {
          const config = getDicaConfig(item);
          return (
            <OptionTextCard
              key={item}
              title={item}
              description={config.desc}
              icon={config.icon}
              selected={i === selectedIndex}
              onClick={() => setSelectedIndex(i)}
            />
          );
        })}
      </div>
    </div>
  );
}

function TrendStep({
  kind,
  step,
  takes,
  setTakes,
}: {
  kind: keyof typeof settings;
  step: number;
  takes: number;
  setTakes: (v: number) => void;
}) {
  const [categoriaIdx, setCategoriaIdx] = useState(0);
  const [objetoIdx, setObjetoIdx] = useState(0);

  const utensilios: { nome: string; slug: string }[] = [
    { nome: "Panela", slug: "panela" },
    { nome: "Frigideira", slug: "frigideira" },
    { nome: "Colher de Pau", slug: "colher-de-pau" },
    { nome: "Faca", slug: "faca" },
    { nome: "Tábua de Corte", slug: "tabua-de-corte" },
    { nome: "Batedeira", slug: "batedeira" },
    { nome: "Liquidificador", slug: "liquidificador" },
    { nome: "Xícara", slug: "xicara" },
  ];
  if (kind === "novelinha")
    return step === 0 ? (
      <div className="space-y-7">
        <TipoHistoriaGrid />
        <Grid title="Estilo dos personagens" items={["Realista (Padrão)", "Criativo (Objetos)"]} />
        <TextArea
          label="Descreva sua ideia (opcional)"
          placeholder="Conte o ponto de partida da história..."
        />
      </div>
    ) : (
      <div className="space-y-7">
        <div className="glass-surface flex items-center justify-between p-5 rounded-[16px] transition-all">
          <div>
            <h3 className="font-bold text-text-1">Personagens</h3>
            <p className="text-xs text-text-2 mt-1">Protagonista, marido e vizinha fofoqueira</p>
          </div>
          <Button variant="secondary" className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 shadow-none text-text-1 transition-all">
            <Plus className="size-4 mr-2" />
            Adicionar personagem
          </Button>
        </div>
        <GlassPillGrid title="Cenário" items={scenarios} />
        <GlassPillGrid title="Tom" items={["Leve", "Dramático", "Pesado"]} />
        <div>
          <SectionTitle title="Takes" />
          <TrendTakesSelector
            value={takes}
            onChange={setTakes}
            options={[
              { takes: 3, seconds: 24 },
              { takes: 5, seconds: 40 },
              { takes: 7, seconds: 56 },
              { takes: 10, seconds: 80 },
            ]}
          />
        </div>
        <TextArea 
          label="Detalhes da trama" 
          placeholder="Conflito, relação e objetivo..." 
          className="!bg-white/[0.03] !border-white/10 focus:!border-accent-400/50 !backdrop-blur-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] transition-colors"
        />
      </div>
    );
  if (kind === "objetos") {
    if (step === 0)
      return (
        <div className="space-y-7">
          <CategoriaGrid
            title="Categoria"
            items={["Alimentos & Frutas", "Utensílios de Cozinha", "Personalizados"]}
            value={categoriaIdx}
            onChange={(v) => {
              setCategoriaIdx(v);
              setObjetoIdx(0); // reset selection when changing category
            }}
          />
          {categoriaIdx === 0 && (
            <ObjetoImageGrid
              title="Escolha o objeto"
              items={["Maçã", "Banana", "Abacate", "Morango", "Laranja", "Tomate", "Alface", "Ovo"]}
              value={objetoIdx}
              onChange={setObjetoIdx}
            />
          )}
          {categoriaIdx === 1 && (
            <ObjetoImageGrid
              title="Escolha o utensílio"
              items={utensilios.map(u => u.nome)}
              value={objetoIdx}
              onChange={setObjetoIdx}
            />
          )}
          {categoriaIdx === 2 && (
            <UploadObjetoCard />
          )}
        </div>
      );
    if (step === 1)
      return (
        <div className="space-y-7">
          <TomDeFalaGrid
            title="Tom de fala"
            items={[
              "Irritado / Revoltado",
              "Sarcástico",
              "Professoral / Sábio",
              "Desesperado",
              "Dramático",
              "Amigável",
            ]}
          />
          <TakesSelector value={takes} onChange={setTakes} />
        </div>
      );
    if (step === 2)
      return (
        <div className="space-y-7">
          <TipoDeDicaGrid
            title="Tipo de dica"
            items={[
              "Armazenamento",
              "Erros Comuns",
              "Conservação",
              "Curiosidade",
              "Uso Correto",
              "Limpeza",
            ]}
          />
          <TakeEditor count={takes} />
        </div>
      );
    return (
      <div className="panel p-6">
        <h2 className="text-xl font-bold">Revisão</h2>
        <p className="mt-2 text-sm text-text-2">
          Maçã · Tom sarcástico · {takes} takes · Dica de armazenamento
        </p>
      </div>
    );
  }
  if (step === 0)
    return (
      <Grid
        title="Tipo de viral"
        items={[
          "Polêmica Leve",
          "Fato Surpreendente",
          "Erro Comum",
          "Segredo Pouco Falado",
          "Curiosidade com Suspense",
          "Ranking",
          "Teste / Experimento",
          "Frase Polêmica",
        ]}
      />
    );
  if (step === 1)
    return (
      <Grid
        title="Estilo de Gancho"
        items={[
          "Ninguém fala sobre isso…",
          "Você está fazendo isso errado…",
          "Eu descobri algo absurdo…",
          "Isso deveria ser proibido…",
          "Presta atenção nisso…",
          "Eu duvido você saber disso…",
        ]}
      />
    );
  if (step === 2) return <VoiceConfig />;
  return (
    <div className="space-y-7">
      <TakesSelector value={takes} onChange={setTakes} />
      <Grid
        title="Influencer e cenário"
        items={["Camila · Quarto", "Rafael · Estúdio", "Marina · Cozinha", "Lucas · Academia"]}
      />
      <TakeEditor count={takes} />
    </div>
  );
}
