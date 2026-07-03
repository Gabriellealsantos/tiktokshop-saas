import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Drama, Flame, MessageCircleMore, Plus, Sparkles, Play } from "lucide-react";
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
import { OptionImageCard } from "@/features/creation/creation-studio";

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
        <div className="panel flex items-center justify-between p-5">
          <div>
            <h3 className="font-bold">Personagens</h3>
            <p className="text-xs text-text-2">Protagonista, marido e vizinha fofoqueira</p>
          </div>
          <Button variant="secondary">
            <Plus />
            Adicionar personagem
          </Button>
        </div>
        <Grid title="Cenário" items={scenarios} />
        <Grid title="Tom" items={["Leve", "Dramático", "Pesado"]} />
        <TakesSelector
          value={takes}
          onChange={setTakes}
          options={[
            { takes: 3, seconds: 24 },
            { takes: 5, seconds: 40 },
            { takes: 7, seconds: 56 },
            { takes: 10, seconds: 80 },
          ]}
        />
        <TextArea label="Detalhes da trama" placeholder="Conflito, relação e objetivo..." />
      </div>
    );
  if (kind === "objetos") {
    if (step === 0)
      return (
        <div className="space-y-7">
          <Grid
            title="Categoria"
            items={["Alimentos & Frutas", "Utensílios de Cozinha", "Personalizados"]}
          />
          <Grid
            title="Escolha o objeto"
            items={["Maçã", "Banana", "Abacate", "Morango", "Laranja", "Tomate", "Alface", "Ovo"]}
          />
        </div>
      );
    if (step === 1)
      return (
        <div className="space-y-7">
          <Grid
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
          <Grid
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
