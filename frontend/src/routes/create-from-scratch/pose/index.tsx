import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { Page, Button, Stepper } from "@/components";
import { toast } from "sonner";
import { avatars, products } from "@/services/data";

import { SummaryGrid } from "./components/summary-grid";
import { PoseSelector } from "./components/pose-selector";

const steps = ["Produto", "Influencer", "Cenário", "Pose + Imagem", "Fala & Voz", "Vídeo"];

export default function PoseScreen() {
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

  const [isLoading, setIsLoading] = useState(true);
  const [poseSelecionada, setPoseSelecionada] = useState<string | null>((search.pose as string) || null);
  const [manualPoseText, setManualPoseText] = useState((search.manualPose as string) || "");

  // Simulando loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Resolvendo mocks para exibir os nomes na barra de resumo
  const produto = products.find((p) => p.id === Number(search.productId));
  const avatar = avatars.find((a) => a.id === Number(search.avatarId));

  // Formatando o resumo do cenário
  const local = search.local ? search.local.charAt(0).toUpperCase() + search.local.slice(1) : "?";
  const timeOfDay = search.timeOfDay ? search.timeOfDay.charAt(0).toUpperCase() + search.timeOfDay.slice(1) : "?";
  const lighting = search.lighting ? search.lighting.charAt(0).toUpperCase() + search.lighting.slice(1) : "?";
  const atmosphere = search.atmosphere ? search.atmosphere.charAt(0).toUpperCase() + search.atmosphere.slice(1) : "?";

  // Botão gerar ativo?
  const isPoseValid = poseSelecionada !== null && (poseSelecionada !== "manual" || manualPoseText.trim().length > 0);

  return (
    <AppShell>
      <Page>
        {/* TOPO */}
        <header className="entrance mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            className="bg-white/5 border border-white/10 hover:bg-white/10"
            onClick={() => {
              const params = new URLSearchParams();
              if (search.productId) params.set("productId", search.productId);
              if (search.avatarId) params.set("avatarId", search.avatarId);
              if (search.applicationMode) params.set("applicationMode", search.applicationMode);
              navigate(`/create-from-scratch/scenario?${params.toString()}`);
            }}
          >
            <ChevronLeft className="size-4 mr-2" />
            Voltar
          </Button>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-[.2em] text-accent-400">
              Criar do zero
            </span>
            <span className="text-sm font-medium text-text-2">
              Passo 4 de 6
            </span>
          </div>
        </header>

        {/* STEPPER */}
        <Stepper steps={steps} current={3} />

        {/* TÍTULO DA ETAPA */}
        <div className="mt-10 mb-8">
          <h1 className="text-3xl font-extrabold tracking-[-.035em] text-text-1 md:text-4xl">
            Pose & geração da imagem
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-2">
            Defina como o avatar deve aparecer com o produto e gere a imagem.
          </p>
        </div>

        {/* LINHA DE RESUMO */}
        <SummaryGrid
          produto={produto}
          avatar={avatar}
          local={local}
          timeOfDay={timeOfDay}
          lighting={lighting}
          atmosphere={atmosphere}
        />

        {/* CARD PRINCIPAL (Seleção da Pose) */}
        <PoseSelector
          isLoading={isLoading}
          poseSelecionada={poseSelecionada}
          setPoseSelecionada={setPoseSelecionada}
          manualPoseText={manualPoseText}
          setManualPoseText={setManualPoseText}
          isPoseValid={isPoseValid}
        />

        {/* RODAPÉ */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <Button
            variant="ghost"
            onClick={() => {
              const params = new URLSearchParams();
              if (search.productId) params.set("productId", search.productId);
              if (search.avatarId) params.set("avatarId", search.avatarId);
              if (search.applicationMode) params.set("applicationMode", search.applicationMode);
              navigate(`/create-from-scratch/scenario?${params.toString()}`);
            }}
            className="text-text-2 hover:text-white"
          >
            Voltar
          </Button>
          <Button
            onClick={() => {
              // TODO: etapa Fala & Voz
              toast("Em breve: Etapa Fala & Voz");
              const params = new URLSearchParams();
              if (search.productId) params.set("productId", search.productId);
              if (search.avatarId) params.set("avatarId", search.avatarId);
              if (search.applicationMode) params.set("applicationMode", search.applicationMode);
              if (search.local) params.set("local", search.local);
              if (search.timeOfDay) params.set("timeOfDay", search.timeOfDay);
              if (search.lighting) params.set("lighting", search.lighting);
              if (search.atmosphere) params.set("atmosphere", search.atmosphere);
              if (poseSelecionada) params.set("pose", poseSelecionada);
              if (manualPoseText) params.set("manualPose", manualPoseText);
              if (search.speechText) params.set("speechText", search.speechText);
              if (search.voiceId) params.set("voiceId", search.voiceId);
              navigate(`/create-from-scratch/speech?${params.toString()}`);
            }}
          >
            Próximo
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      </Page>
    </AppShell>
  );
}
