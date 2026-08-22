import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence } from "motion/react";
import { Check, Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Page } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { cn } from "@/utils/utils";
import { isUnlimited } from "@/utils/limit-display";
import {
  generateViralPrompt,
  generateViralScripts,
  getViralTemplate,
  getViralUsage,
} from "@/services/viralService";
import type {
  PendingJob,
  ViralScript,
  ViralTemplateDetail,
  ViralUsage,
} from "@/models/viral";
import { useGenerationWs } from "@/hooks/useGenerationWs";
import { TrendHeader } from "../components/trend-header";

import { LoadingScreen } from "./components/loading-screen";
import { CharacterSidebar } from "./components/character-sidebar";
import { ToneSelector } from "./components/tone-selector";
import { ScriptSelector } from "./components/script-selector";
import { PromptResult } from "./components/prompt-result";

export default function RouteComponent() {
  const { template: templateId = "", characterId = "" } = useParams();
  const queryClient = useQueryClient();

  const { data: template, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ["viral-template", templateId],
    queryFn: async () => {
      const res = await getViralTemplate(templateId);
      return res.data as ViralTemplateDetail;
    },
    enabled: !!templateId,
  });

  const character = template?.characters.find((c) => c.slug === characterId);
  const tones = template?.tones ?? [];

  const { data: usage } = useQuery({
    queryKey: ["viral-usage"],
    queryFn: async () => {
      const res = await getViralUsage();
      return res.data as ViralUsage;
    },
  });

  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);
  const { waitForJob } = useGenerationWs();

  const {
    mutate: generateScripts,
    data: scripts,
    isPending: isGeneratingScripts,
  } = useMutation({
    mutationFn: async (tone: string) => {
      const res = await generateViralScripts({
        templateSlug: templateId,
        characterSlug: characterId,
        tone,
      });
      const { jobId } = res.data as PendingJob;
      const result = await waitForJob(jobId);
      if (result.status === "FAILED") throw new Error(result.error || "Erro");
      return result.data as ViralScript[];
    },
    onSuccess: () => setSelectedScript(null),
    onError: () => {
      toast.error("Erro ao gerar roteiros. Tente novamente.");
    },
  });

  const {
    mutate: generatePrompt,
    data: finalPrompt,
    isPending: isGeneratingPrompt,
    isSuccess: isPromptSuccess,
    reset: resetPrompt,
  } = useMutation({
    mutationFn: async () => {
      const script = scripts?.find((s: ViralScript) => s.id === selectedScript);
      if (!script) throw new Error("no-script");
      const res = await generateViralPrompt({
        templateSlug: templateId,
        characterSlug: characterId,
        tone: selectedTone!,
        script,
      });
      const { jobId } = res.data as PendingJob;
      const result = await waitForJob(jobId);
      if (result.status === "FAILED") throw new Error(result.error || "Erro");
      return result.data as string;
    },
    onSuccess: () => {
      // A cota do dia mudou — refetch do badge de uso.
      queryClient.invalidateQueries({ queryKey: ["viral-usage"] });
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        toast.error(
          `Você atingiu o limite diário${usage && !isUnlimited(usage.max) ? ` (${usage.max})` : ""} de prompts virais. Tente novamente amanhã.`,
        );
      } else {
        toast.error("Erro ao gerar o prompt. Tente novamente.");
      }
      setLoadingStage(0);
    },
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

  if (isLoadingTemplate) {
    return (
      <AppShell>
        <Page className="pt-0 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="size-6 animate-spin text-brand-400" />
        </Page>
      </AppShell>
    );
  }

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
      <Page className="pt-0 -mt-6 pb-36 px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          {/* Cabeçalho Compacto & Stepper no TOPO */}
          <div className="rounded-[24px] bg-[#0F0D15]/20 backdrop-blur-3xl border border-white/5 py-5 px-6 mb-6">
            <TrendHeader
              title="Trend"
              subtitle="Turbine seu Engajamento"
              description=""
              compact
            />

            {/* Stepper + cota */}
            <div className="flex items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex items-center gap-2 text-brand-300 font-semibold text-sm">
                  <div className="flex items-center justify-center size-6 rounded-full bg-brand-500/20 text-brand-400">
                    <Check className="size-3.5" />
                  </div>
                  Personagem
                </div>
                <div className="w-8 h-px bg-white/10" />
                <div
                  className={cn(
                    "flex items-center gap-2 font-semibold text-sm",
                    isStep3 ? "text-brand-300" : "text-white",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center size-6 rounded-full",
                      isStep3
                        ? "bg-brand-500/20 text-brand-400"
                        : "bg-brand-500/25 border border-brand-500 text-brand-300 shadow-[0_0_15px_-2px_rgba(75,68,232,0.5)]",
                    )}
                  >
                    {isStep3 ? <Check className="size-3.5" /> : "2"}
                  </div>
                  Tom & roteiro
                </div>
                <div className="w-8 h-px bg-white/10" />
                <div
                  className={cn(
                    "flex items-center gap-2 font-semibold text-sm",
                    isStep3 ? "text-white" : "text-text-3",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center size-6 rounded-full",
                      isStep3
                        ? "bg-brand-500/25 border border-brand-500 text-brand-300 shadow-[0_0_15px_-2px_rgba(75,68,232,0.5)]"
                        : "bg-white/5",
                    )}
                  >
                    3
                  </div>
                  Prompt + download
                </div>
              </div>

              {usage && (
                <div
                  className="hidden sm:inline-flex items-center gap-1.5 shrink-0 rounded-full border border-white/10 bg-deep px-3 py-1 text-xs font-semibold text-text-2"
                  title="Prompts virais gerados hoje"
                >
                  <Rocket
                    className={cn(
                      "size-3.5",
                      isUnlimited(usage.max) || usage.remaining > 0
                        ? "text-brand-400"
                        : "text-red-400",
                    )}
                  />
                  {isUnlimited(usage.max)
                    ? "∞ restantes hoje"
                    : `${usage.remaining}/${usage.max} restantes hoje`}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[24px] bg-[#0F0D15]/20 backdrop-blur-3xl border border-white/5 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
              {/* COLUNA ESQUERDA - STICKY */}
              <CharacterSidebar
                character={character}
                templateId={templateId}
                isStep3={isStep3}
              />

              {/* COLUNA DIREITA - PAINEL DE TRABALHO */}
              <div className="flex flex-col rounded-2xl">
                {!isStep3 ? (
                  <>
                    {/* ETAPA 2A: Escolha o tom */}
                    <ToneSelector
                      tones={tones}
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
                          generateScripts={(tone: string) =>
                            generateScripts(tone)
                          }
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
        </div>
      </Page>
    </AppShell>
  );
}
