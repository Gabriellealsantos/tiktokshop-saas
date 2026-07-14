import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Page } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { cn } from "@/utils/utils";
import { TrendHeader } from "../components/trend-header";
import { trendTemplates } from "../components/trend-data";

import { LoadingScreen } from "./components/loading-screen";
import { CharacterSidebar } from "./components/character-sidebar";
import { ToneSelector } from "./components/tone-selector";
import { ScriptSelector } from "./components/script-selector";
import { PromptResult } from "./components/prompt-result";

export default function RouteComponent() {
  const { template: templateId = "", characterId = "" } = useParams();
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
    return <LoadingScreen character={character} loadingStage={loadingStage} />;
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
            <CharacterSidebar character={character} templateId={templateId} isStep3={isStep3} />

            {/* COLUNA DIREITA - PAINEL DE TRABALHO */}
            <div className="flex flex-col bg-surface-2 border border-white/5 rounded-2xl p-5">
              {!isStep3 ? (
                <>
                  {/* ETAPA 2A: Escolha o tom */}
                  <ToneSelector
                    selectedTone={selectedTone}
                    setSelectedTone={setSelectedTone}
                    isGeneratingScripts={isGeneratingScripts}
                    generateScripts={(tone: string) => generateScripts(tone)}
                    hasScripts={!!scripts}
                  />

                  {/* ETAPA 2B: Roteiros (Revelada suavemente) */}
                  <AnimatePresence>
                    {scripts && (
                      <ScriptSelector
                        scripts={scripts}
                        selectedScript={selectedScript}
                        setSelectedScript={setSelectedScript}
                        selectedTone={selectedTone}
                        isGeneratingScripts={isGeneratingScripts}
                        generateScripts={(tone: string) => generateScripts(tone)}
                        generatePrompt={generatePrompt}
                      />
                    )}
                  </AnimatePresence>
                </>
              ) : (
                /* ETAPA 3: PROMPT GERADO */
                finalPrompt && (
                  <PromptResult
                    finalPrompt={finalPrompt}
                    handleCopy={handleCopy}
                    resetPrompt={resetPrompt}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </Page>
    </AppShell>
  );
}
