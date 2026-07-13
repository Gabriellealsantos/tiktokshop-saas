import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Smile, Meh, Shuffle, Heart, Film, Sparkles, Check, Loader2, Copy, Download, ArrowRight, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Page, Button } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { cn } from "@/utils/utils";
import { TrendHeader } from "..";
import { trendTemplates } from "../trend-data";

const TONES = [
  { id: "funny", label: "Engraçado", desc: "Punchline e humor leve", icon: Smile },
  { id: "sarcastic", label: "Sarcástico", desc: "Humor seco, deadpan", icon: Meh },
  { id: "absurd", label: "Absurdo", desc: "Viradas inesperadas, surreal", icon: Shuffle },
  { id: "cute", label: "Ternurinha", desc: "Fofo e carismático", icon: Heart },
  { id: "nostalgic", label: "Nostálgico", desc: "Memória afetiva quente", icon: Film },
];

export function TrendCharacterFlow({ templateId, characterId }: { templateId: string; characterId: string }) {
  const navigate = useNavigate();
  const template = trendTemplates[templateId];
  const character = template?.characters.find((c) => c.id === characterId);

  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);

  const { mutate: generateScripts, data: scripts, isPending: isGeneratingScripts } = useMutation({
    mutationFn: async (toneId: string) => {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return [
        {
          id: "script-1",
          title: "O IPVA Tá Pago",
          description: "O personagem está no seu veículo/base e faz um som de motor potente com a boca enquanto simula mudar de marcha no ar, olhando para a câmera com um sorriso maroto.",
          quote: "Pode avisar que o motorista de elite da vila acabou de passar!"
        },
        {
          id: "script-2",
          title: "Fofoca na Janela",
          description: "Olha rapidamente para os lados como se estivesse vigiando alguém, se aproxima da câmera e sussurra gesticulando bastante.",
          quote: "Você não vai acreditar no que eu acabei de escutar na padaria..."
        },
        {
          id: "script-3",
          title: "Conselho de Ouro",
          description: "Assume uma postura mais séria, levanta um dedo como quem vai dar uma lição de moral e depois sorri amistosamente.",
          quote: "Se tem uma coisa que a vida ensina, é que pressa não enche barriga."
        }
      ];
    },
    onError: () => {
      toast.error("Erro ao gerar roteiros. Tente novamente.");
    }
  });

  const { mutate: generatePrompt, data: finalPrompt, isPending: isGeneratingPrompt, isSuccess: isPromptSuccess, reset: resetPrompt } = useMutation({
    mutationFn: async () => {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 6000));
      return `[Scene: A vintage living room setup, natural lighting, medium close-up shot]
Character: An energetic elder person sitting on a small tricycle, pretending to ride it like a heavy motorcycle.

Action: The character intensely grips the imaginary handlebars, making loud, exaggerated motorcycle engine noises with their mouth. They simulate kicking a gear shifter and then look directly into the camera with a mischievous, confident smile.

Dialogue: "Pode avisar que o motorista de elite da vila acabou de passar!"

Style: cinematic, 4k, hyper-detailed, tiktok style viral short, dynamic motion, vibrant colors.`;
    },
    onError: () => {
      toast.error("Erro ao gerar o prompt. Tente novamente.");
      setLoadingStage(0);
    }
  });

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>, t2: ReturnType<typeof setTimeout>;
    if (isGeneratingPrompt) {
      setLoadingStage(1);
      t1 = setTimeout(() => setLoadingStage(2), 2000);
      t2 = setTimeout(() => setLoadingStage(3), 4000);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isGeneratingPrompt]);

  const handleCopy = () => {
    if (finalPrompt) {
      navigator.clipboard.writeText(finalPrompt);
      toast.success("Prompt copiado!");
    }
  };

  if (!template || !character) {
    return (
      <AppShell>
        <Page className="pt-0 flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-text-2 mb-4">Personagem não encontrado.</p>
          <Link to="/trend-boost" className="text-brand-400 hover:underline">
            Voltar
          </Link>
        </Page>
      </AppShell>
    );
  }

  // TELA DE CARREGAMENTO IMERSIVA
  if (isGeneratingPrompt) {
    return (
      <AppShell>
        <Page className="pt-0 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-md mx-auto flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl animate-pulse" />
              <div className="relative size-32 rounded-full overflow-hidden border-4 border-brand-500 shadow-[0_0_30px_rgba(75,68,232,0.5)]">
                <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
              </div>
            </motion.div>

            <h2 className="text-3xl font-extrabold text-white mb-3">
              Montando o roteiro de{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(120deg, var(--brand-300) 0%, var(--brand-500) 100%)" }}>
                {character.name}
              </span>
            </h2>
            <p className="text-text-2 mb-10 max-w-sm">
              A IA está estruturando cena, ritmo e fala em inglês cinematográfico.
            </p>

            <div className="flex flex-col gap-3 w-full">
              {[
                { step: 1, text: "Analisando referência visual" },
                { step: 2, text: "Compondo direção de cena" },
                { step: 3, text: "Refinando fala e timing" }
              ].map((item) => {
                const isActive = loadingStage === item.step;
                const isPast = loadingStage > item.step;
                const isPendingStage = loadingStage < item.step;

                return (
                  <motion.div
                    key={item.step}
                    layout
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-full border transition-all duration-300",
                      isActive ? "bg-brand-500/10 border-brand-500 shadow-[0_0_20px_-5px_rgba(75,68,232,0.4)]" : "bg-surface-2 border-white/5",
                      isPendingStage ? "opacity-50" : "opacity-100"
                    )}
                  >
                    <div className="size-6 flex items-center justify-center shrink-0">
                      {isPast ? (
                        <Check className="size-5 text-brand-400" />
                      ) : isActive ? (
                        <Loader2 className="size-5 text-brand-400 animate-spin" />
                      ) : (
                        <div className="size-2 rounded-full bg-white/20" />
                      )}
                    </div>
                    <span className={cn(
                      "font-medium",
                      isActive ? "text-brand-100" : isPast ? "text-white" : "text-text-3"
                    )}>
                      {item.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Page>
      </AppShell>
    );
  }

  const isStep3 = isPromptSuccess;

  return (
    <AppShell>
      <Page className="pt-4 md:pt-6 pb-36">
        <div className="mx-auto max-w-6xl">
          
          {/* Cabeçalho Compacto & Stepper no TOPO */}
          <div className="mb-8">
            <TrendHeader
              title="Viralize"
              subtitle="Turbine seu Engajamento"
              description=""
              compact
            />
            
            {/* Stepper */}
            <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex items-center gap-2 text-brand-300 font-semibold text-sm">
                <div className="flex items-center justify-center size-6 rounded-full bg-brand-500/20 text-brand-400">
                  <Check className="size-3.5" />
                </div>
                Personagem
              </div>
              <div className="w-8 h-px bg-white/10" />
              <div className={cn("flex items-center gap-2 font-semibold text-sm", isStep3 ? "text-brand-300" : "text-white")}>
                <div className={cn("flex items-center justify-center size-6 rounded-full", isStep3 ? "bg-brand-500/20 text-brand-400" : "bg-brand-500 text-white shadow-[0_0_12px_rgba(75,68,232,0.5)]")}>
                  {isStep3 ? <Check className="size-3.5" /> : "2"}
                </div>
                Tom & roteiro
              </div>
              <div className="w-8 h-px bg-white/10" />
              <div className={cn("flex items-center gap-2 font-semibold text-sm", isStep3 ? "text-white" : "text-text-3")}>
                <div className={cn("flex items-center justify-center size-6 rounded-full", isStep3 ? "bg-brand-500 text-white shadow-[0_0_12px_rgba(75,68,232,0.5)]" : "bg-white/5")}>
                  3
                </div>
                Prompt + download
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
            
            {/* COLUNA ESQUERDA - STICKY */}
            <div className="lg:sticky lg:top-24 flex flex-col gap-4">
              <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-surface-2 border border-white/10 shadow-lg">
                {/* Fallback Icon */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 bg-surface-2">
                  <ImageIcon className="size-8 opacity-50" />
                </div>
                <img
                  src={character.image}
                  alt={character.name}
                  className="absolute inset-0 w-full h-full object-cover z-10"
                  onError={(e) => { e.currentTarget.style.opacity = "0"; }}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-20" />
                <div className="absolute bottom-0 inset-x-0 p-4 z-30">
                  <h3 className="font-bold text-white text-lg">{character.name}</h3>
                </div>
              </div>

              {!isStep3 && (
                <Link
                  to="/trend-boost/$template"
                  params={{ template: templateId }}
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-text-2 hover:text-white transition-colors"
                >
                  <ChevronLeft className="size-4" />
                  Trocar personagem
                </Link>
              )}

              {isStep3 && (
                <a
                  href={character.image}
                  download
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-surface-2 hover:bg-surface-3 transition-colors text-sm font-semibold text-white"
                >
                  <Download className="size-4 text-text-2" />
                  Baixar imagem
                </a>
              )}
            </div>

            {/* COLUNA DIREITA - PAINEL DE TRABALHO */}
            <div className="flex flex-col bg-surface-2 border border-white/5 rounded-2xl p-5">
              {!isStep3 ? (
                <>
                  {/* ETAPA 2A: Escolha o tom */}
                  <section className={cn(scripts ? "mb-6" : "mb-0")}>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-bold text-white">Escolha o tom do vídeo</h2>
                      <div className="px-2 py-0.5 rounded-full bg-deep border border-white/5 text-[9px] font-bold tracking-wider text-text-2 uppercase">
                        8 Segundos · 3 Roteiros
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
                      {TONES.map((tone) => {
                        const isSelected = selectedTone === tone.id;
                        const Icon = tone.icon;
                        return (
                          <button
                            key={tone.id}
                            onClick={() => setSelectedTone(tone.id)}
                            className={cn(
                              "relative flex flex-col items-center text-center gap-1 p-2 rounded-xl border transition-all duration-200 outline-none",
                              isSelected
                                ? "bg-brand-500/10 border-brand-500 shadow-[0_0_15px_-4px_rgba(75,68,232,0.4)]"
                                : "bg-deep/50 border-white/10 hover:border-white/20 hover:bg-deep"
                            )}
                          >
                            <div className={cn(
                              "p-1 rounded-md mb-0.5",
                              isSelected ? "bg-brand-500 text-white" : "bg-white/5 text-text-2"
                            )}>
                              <Icon className="size-3.5" />
                            </div>
                            <span className={cn("font-bold text-[11px]", isSelected ? "text-white" : "text-text-1")}>
                              {tone.label}
                            </span>
                            <span className="text-[9px] text-text-3 leading-tight px-0.5">
                              {tone.desc}
                            </span>
                            
                            {isSelected && (
                              <div className="brand-gradient accent-glow absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full z-10">
                                <Check className="size-2.5 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-xs text-text-3 mb-4">
                      Duração fixa de 8 segundos. A IA analisa a cena do personagem e gera 3 roteiros virais prontos.
                    </p>

                    {!scripts && (
                      <Button
                        className="w-full btn-brand h-10 text-sm"
                        disabled={!selectedTone || isGeneratingScripts}
                        onClick={() => selectedTone && generateScripts(selectedTone)}
                      >
                        {isGeneratingScripts ? (
                          <>
                            <Loader2 className="size-3.5 mr-2 animate-spin" />
                            Analisando com IA...
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-3.5 mr-2" />
                            Analisar com IA & gerar 3 roteiros
                          </>
                        )}
                      </Button>
                    )}
                  </section>

                  {/* ETAPA 2B: Roteiros (Revelada suavemente) */}
                  <AnimatePresence>
                    {scripts && (
                      <motion.section
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-3 pt-4 border-t border-white/5">
                          <h2 className="text-lg font-bold text-white">Escolha um roteiro</h2>
                          <button
                            onClick={() => {
                              setSelectedScript(null);
                              if (selectedTone) {
                                generateScripts(selectedTone);
                              }
                            }}
                            disabled={isGeneratingScripts}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors disabled:opacity-50"
                          >
                            {isGeneratingScripts ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                            Gerar novos
                          </button>
                        </div>

                        <div className="flex flex-col gap-2 mb-5">
                          {scripts.map((script) => {
                            const isSelected = selectedScript === script.id;
                            return (
                              <button
                                key={script.id}
                                onClick={() => setSelectedScript(script.id)}
                                className={cn(
                                  "relative text-left p-3.5 rounded-xl border transition-all duration-200 outline-none",
                                  isSelected
                                    ? "bg-brand-500/10 border-brand-500 shadow-[0_0_15px_-4px_rgba(75,68,232,0.4)]"
                                    : "bg-deep border-white/10 hover:border-white/20"
                                )}
                              >
                                <h4 className="font-bold text-white text-[13px] mb-1">{script.title}</h4>
                                <p className="text-[12px] text-text-2 leading-snug mb-2.5">
                                  {script.description}
                                </p>
                                <div className={cn(
                                  "pl-3 py-1 border-l-2 text-[13px] font-medium italic",
                                  isSelected ? "border-brand-500 text-brand-100 bg-brand-500/5 rounded-r" : "border-white/20 text-white/80"
                                )}>
                                  "{script.quote}"
                                </div>

                                {isSelected && (
                                  <div className="brand-gradient accent-glow absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full z-10">
                                    <Check className="size-3 text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <Button
                          className="w-full btn-brand h-10 text-sm"
                          disabled={!selectedScript}
                          onClick={() => generatePrompt()}
                        >
                          <Sparkles className="size-3.5 mr-2" />
                          Gerar prompt do vídeo
                        </Button>
                      </motion.section>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                /* ETAPA 3: PROMPT GERADO */
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col"
                >
                  <div className="rounded-xl border border-white/10 bg-deep p-5 mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white text-[15px]">Prompt gerado (em inglês)</h3>
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-2 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md"
                      >
                        <Copy className="size-3" />
                        Copiar
                      </button>
                    </div>

                    <div className="bg-[#0b0914] rounded-lg p-4 border border-white/5 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      <pre className="font-mono text-xs text-text-2 whitespace-pre-wrap leading-[1.6]">
                        {finalPrompt}
                      </pre>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="https://lumaai.com/dream-machine"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-brand inline-flex items-center justify-center h-10 text-sm rounded-xl font-semibold px-4 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_0_15px_-4px_rgba(75,68,232,0.6)]"
                    >
                      Abrir Google Flow
                      <ArrowRight className="ml-1.5 size-3.5" />
                    </a>
                    <Button
                      variant="outline"
                      className="flex-1 h-10 text-sm rounded-xl"
                      onClick={() => resetPrompt()}
                    >
                      Gerar outro
                    </Button>
                  </div>
                </motion.section>
              )}
            </div>
          </div>
        </div>
      </Page>
    </AppShell>
  );
}
