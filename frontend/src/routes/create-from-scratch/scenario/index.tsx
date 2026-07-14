import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { Page, Button, Stepper } from "@/components";
import { toast } from "sonner";

import { LocalSelector } from "./components/location-selector";
import { TimeSelector } from "./components/time-selector";
import { LightingSelector } from "./components/lighting-selector";
import { AtmosphereSelector } from "./components/atmosphere-selector";
import { SummaryBar } from "./components/summary-bar";

const steps = ["Produto", "Influencer", "Cenário", "Pose + Imagem", "Fala & Voz", "Vídeo"];

export default function ScenarioScreen() {
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
  };

  // State from URL if navigating back from future steps
  const [localSelecionado, setLocalSelecionado] = useState<string | null>(search.local || null);
  const [timeOfDaySelected, setTimeOfDaySelected] = useState<string | null>(search.timeOfDay || null);
  const [lightingSelected, setLightingSelected] = useState<string | null>(search.lighting || null);
  const [atmosphereSelected, setAtmosphereSelected] = useState<string | null>(search.atmosphere || null);

  const isFormComplete = localSelecionado && timeOfDaySelected && lightingSelected && atmosphereSelected;

  return (
    <AppShell>
      <Page>
        {/* TOPO */}
        <header className="entrance mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            className="bg-white/5 border border-white/10 hover:bg-white/10"
            onClick={() => navigate(`/create-from-scratch?${searchParams.toString()}`)}
          >
            <ChevronLeft className="size-4 mr-2" />
            Voltar
          </Button>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-[.2em] text-accent-400">
              Criar do zero
            </span>
            <span className="text-sm font-medium text-text-2">
              Passo 3 de 6
            </span>
          </div>
        </header>

        {/* STEPPER */}
        <Stepper steps={steps} current={2} />

        {/* TÍTULO DA ETAPA */}
        <div className="mt-10 mb-8">
          <h1 className="text-3xl font-extrabold tracking-[-.035em] text-text-1 md:text-4xl">
            Monte o cenário
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-2">
            Escolha uma opção em cada passo abaixo.
          </p>
        </div>

        {/* 1. LOCAL */}
        <LocalSelector localSelecionado={localSelecionado} setLocalSelecionado={setLocalSelecionado} />

        {/* 2. HORA DO DIA */}
        <TimeSelector timeOfDaySelected={timeOfDaySelected} setTimeOfDaySelected={setTimeOfDaySelected} />

        {/* 3. ILUMINAÇÃO */}
        <LightingSelector lightingSelected={lightingSelected} setLightingSelected={setLightingSelected} />

        {/* 4. ATMOSFERA */}
        <AtmosphereSelector atmosphereSelected={atmosphereSelected} setAtmosphereSelected={setAtmosphereSelected} />

        {/* BARRA DE RESUMO */}
        <SummaryBar
          localSelecionado={localSelecionado}
          timeOfDaySelected={timeOfDaySelected}
          lightingSelected={lightingSelected}
          atmosphereSelected={atmosphereSelected}
        />

        {/* RODAPÉ */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/create-from-scratch?${searchParams.toString()}`)}
            className="text-text-2 hover:text-white"
          >
            Voltar
          </Button>
          <Button
            disabled={!isFormComplete}
            onClick={() => {
              // TODO: etapa Pose + Imagem
              toast("Em breve: Etapa Pose + Imagem");
              const params = new URLSearchParams();
              if (search.productId) params.set("productId", search.productId);
              if (search.avatarId) params.set("avatarId", search.avatarId);
              if (search.applicationMode) params.set("applicationMode", search.applicationMode);
              if (localSelecionado) params.set("local", localSelecionado);
              if (timeOfDaySelected) params.set("timeOfDay", timeOfDaySelected);
              if (lightingSelected) params.set("lighting", lightingSelected);
              if (atmosphereSelected) params.set("atmosphere", atmosphereSelected);
              if (search.pose) params.set("pose", search.pose);
              if (search.manualPose) params.set("manualPose", search.manualPose);
              navigate(`/create-from-scratch/pose?${params.toString()}`);
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
