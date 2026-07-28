import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { Page, Button, Stepper } from "@/components";
import { toast } from "sonner";

import { ScriptEditor } from "./components/script-editor";
import { VoiceSelector } from "./components/voice-selector";
import { GenerationSummary } from "./components/generation-summary";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getStudioSession,
  generateStudioVideoPrompt,
} from "@/services/studioService";
import { NARRATOR_VOICE } from "@/models/studio";
import { extractError } from "@/utils/api-error";
import type { CreationSessionDTO } from "@/models/studio";

const steps = [
  "Produto",
  "Influencer",
  "Cenário",
  "Pose + Imagem",
  "Fala & Voz",
  "Vídeo",
];

export default function SpeechScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = {
    productId: searchParams.get("productId") ?? undefined,
    avatarId: searchParams.get("avatarId") ?? undefined,
    applicationMode: searchParams.get("applicationMode") ?? undefined,
    local: searchParams.get("local") ?? undefined,
    timeOfDay: searchParams.get("timeOfDay") ?? undefined,
    lighting: searchParams.get("lighting") ?? undefined,
    atmosphere: searchParams.get("atmosphere") ?? undefined,
    pose: searchParams.get("pose") ?? undefined,
    manualPose: searchParams.get("manualPose") ?? undefined,
    speechText: searchParams.get("speechText") ?? undefined,
    voiceId: searchParams.get("voiceId") ?? undefined,
  };

  const [speechText, setSpeechText] = useState(search.speechText || "");
  const [voiceId, setVoiceId] = useState(search.voiceId || "voice-1");

  const sessionId = searchParams.get("sessionId");

  const { data: session } = useQuery({
    queryKey: ["studio-session", sessionId],
    queryFn: async () => {
      const response = await getStudioSession(Number(sessionId));
      return response.data as CreationSessionDTO;
    },
    enabled: !!sessionId,
  });

  const generatePrompt = useMutation({
    mutationFn: async () => {
      const response = await generateStudioVideoPrompt({
        sessionId: Number(sessionId),
        script: speechText.trim(),
        voice: NARRATOR_VOICE[voiceId],
      });
      return response.data as CreationSessionDTO;
    },
    onError: (err) =>
      toast.error(extractError(err, "Erro ao gerar o prompt do vídeo.")),
  });

  return (
    <AppShell>
      <Page>
        {/* TOPO */}
        <header className="entrance mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            className="bg-white/5 border border-white/10 hover:bg-white/10"
            onClick={() =>
              navigate(`/create-from-scratch/pose?${searchParams.toString()}`)
            }
          >
            <ChevronLeft className="size-4 mr-2" />
            Voltar
          </Button>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-[.2em] text-accent-400">
              Criar do zero
            </span>
            <span className="text-sm font-medium text-text-2">
              Passo 5 de 6
            </span>
          </div>
        </header>

        {/* STEPPER */}
        <Stepper steps={steps} current={4} />

        {/* TÍTULO DA ETAPA */}
        <div className="mt-10 mb-8">
          <h1 className="text-3xl font-extrabold tracking-[-.035em] text-text-1 md:text-4xl">
            Fala & Voz
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-2">
            Escreva o roteiro e selecione a voz para o seu vídeo.
          </p>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ScriptEditor
              speechText={speechText}
              setSpeechText={setSpeechText}
            />
            <VoiceSelector voiceId={voiceId} setVoiceId={setVoiceId} />
          </div>

          <GenerationSummary session={session} />
        </div>

        {/* RODAPÉ */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-8">
          <Button
            variant="ghost"
            onClick={() =>
              navigate(`/create-from-scratch/pose?${searchParams.toString()}`)
            }
            className="text-text-2 hover:text-white"
          >
            Voltar
          </Button>
          <Button
            onClick={() => {
              generatePrompt.mutate(undefined, {
                onSuccess: (updated) => {
                  const videoPrompt = updated.config?.videoPrompt as string;
                  const params = new URLSearchParams(searchParams);
                  params.set("sessionId", String(updated.id));
                  navigate(`/create-from-scratch/video?${params.toString()}`, {
                    state: { videoPrompt, imageUrl: updated.config?.imageUrl },
                  });
                },
              });
            }}
            disabled={
              !speechText.trim() || generatePrompt.isPending || !sessionId
            }
          >
            {generatePrompt.isPending ? "Gerando prompt..." : "Avançar"}
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      </Page>
    </AppShell>
  );
}
