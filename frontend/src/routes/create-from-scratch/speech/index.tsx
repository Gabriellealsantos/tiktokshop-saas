import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { Page, Button, Stepper } from "@/components";
import { toast } from "sonner";
import { avatars, products } from "@/services/data";

import { ScriptEditor } from "./components/script-editor";
import { VoiceSelector } from "./components/voice-selector";
import { GenerationSummary } from "./components/generation-summary";

const steps = ["Produto", "Influencer", "Cenário", "Pose + Imagem", "Fala & Voz", "Vídeo"];

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

  // Resolvendo mocks para exibir os nomes na barra de resumo
  const produto = products.find((p) => p.id === Number(search.productId));
  const avatar = avatars.find((a) => a.id === Number(search.avatarId));

  // Formatando o resumo do cenário
  const local = search.local ? search.local.charAt(0).toUpperCase() + search.local.slice(1) : "?";
  const timeOfDay = search.timeOfDay ? search.timeOfDay.charAt(0).toUpperCase() + search.timeOfDay.slice(1) : "?";

  return (
    <AppShell>
      <Page>
        {/* TOPO */}
        <header className="entrance mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            className="bg-white/5 border border-white/10 hover:bg-white/10"
            onClick={() => navigate(`/create-from-scratch/pose?${searchParams.toString()}`)}
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
            <ScriptEditor speechText={speechText} setSpeechText={setSpeechText} />
            <VoiceSelector voiceId={voiceId} setVoiceId={setVoiceId} />
          </div>

          <GenerationSummary 
            produto={produto}
            avatar={avatar}
            search={search}
            local={local}
            timeOfDay={timeOfDay}
          />
        </div>

        {/* RODAPÉ */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/create-from-scratch/pose?${searchParams.toString()}`)}
            className="text-text-2 hover:text-white"
          >
            Voltar
          </Button>
          <Button
            onClick={() => {
              toast("Geração do vídeo iniciada!");
            }}
            disabled={!speechText.trim()}
          >
            Avançar
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      </Page>
    </AppShell>
  );
}
