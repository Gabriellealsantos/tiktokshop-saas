import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { cn } from "@/utils/utils";
import { AppShell } from "@/layouts/app-shell";
import { Page, Button, Stepper } from "@/components";

import { SummaryGrid } from "./components/summary-grid";
import { PoseSelector } from "./components/pose-selector";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  generateStudioImage,
  getPoseSuggestions,
} from "@/services/studioService";
import {
  SCENE_LOCATION,
  TIME_OF_DAY,
  SCENE_LIGHTING,
  SCENE_ATMOSPHERE,
} from "@/models/studio";
import { extractError } from "@/utils/api-error";
import type { CreationSessionDTO } from "@/models/studio";
import { PONTOS_DE_VISTA } from "./pov-data";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/services/productService";
import {
  useMyAvatars,
  useGalleryAvatars,
} from "@/routes/create-avatar/api/use-avatars";

const steps = [
  "Produto",
  "Influencer",
  "Cenário",
  "Pose + Imagem",
  "Fala & Voz",
  "Vídeo",
];

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

  const [poseSelecionada, setPoseSelecionada] = useState<string | null>(
    (search.pose as string) || null,
  );

  const [manualPoseText, setManualPoseText] = useState(
    (search.manualPose as string) || "",
  );

  const [pontoDeVista, setPontoDeVista] = useState(
    searchParams.get("pov") || "selfie",
  );

  const [jaRegenerou, setJaRegenerou] = useState(false);

  const rawAvatar = searchParams.get("avatarId") ?? "";
  const isGallery = rawAvatar.startsWith("g");
  const avatarNumericId = Number(rawAvatar.slice(1));

  const rawProductId = searchParams.get("productId");
  const customName = searchParams.get("customProductName") ?? undefined;
  const customImage = searchParams.get("customProductImageUrl") ?? undefined;

  const productKey = rawProductId ?? customName ?? "none";

  const {
    data: sugestoes = [],
    isFetching: loadingSugestoes,
    refetch: refetchSugestoes,
  } = useQuery({
    queryKey: ["pose-suggestions", productKey],
    queryFn: async () => {
      const response = await getPoseSuggestions({
        productId: rawProductId ? Number(rawProductId) : undefined,
        customProductName: customName,
      });
      return response.data.poses as string[];
    },
    enabled: !!rawProductId || !!customName,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });

  const { data: productData } = useQuery({
    queryKey: ["product", rawProductId],
    queryFn: async () => {
      const response = await getProductById(Number(rawProductId));
      return response.data as { name: string; imageUrl: string };
    },
    enabled: !!rawProductId,
  });

  const { data: myAvatars } = useMyAvatars();
  const { data: gallery } = useGalleryAvatars();

  const avatarReal = isGallery
    ? (gallery ?? []).find((a) => a.id === avatarNumericId)
    : (myAvatars?.items ?? []).find((a) => a.id === avatarNumericId);

  const produto = customName
    ? { name: customName, image: customImage }
    : productData
      ? { name: productData.name, image: productData.imageUrl }
      : undefined;

  const avatar = avatarReal
    ? { name: avatarReal.name, image: avatarReal.imageUrl }
    : undefined;

  // Formatando o resumo do cenário
  const local = search.local
    ? search.local.charAt(0).toUpperCase() + search.local.slice(1)
    : "?";
  const timeOfDay = search.timeOfDay
    ? search.timeOfDay.charAt(0).toUpperCase() + search.timeOfDay.slice(1)
    : "?";
  const lighting = search.lighting
    ? search.lighting.charAt(0).toUpperCase() + search.lighting.slice(1)
    : "?";
  const atmosphere = search.atmosphere
    ? search.atmosphere.charAt(0).toUpperCase() + search.atmosphere.slice(1)
    : "?";

  // Botão gerar ativo?
  const isPoseValid =
    poseSelecionada !== null &&
    (poseSelecionada !== "manual" || manualPoseText.trim().length > 0);

  const generate = useMutation({
    mutationFn: async () => {
      const poseText =
        poseSelecionada === "manual"
          ? manualPoseText.trim()
          : (poseSelecionada ?? "");

      const response = await generateStudioImage({
        productId: rawProductId ? Number(rawProductId) : undefined,
        customProductName: customName,
        customProductImageUrl: customImage,
        avatarId: isGallery ? undefined : avatarNumericId,
        galleryAvatarId: isGallery ? avatarNumericId : undefined,
        format: "UGC",
        location: SCENE_LOCATION[search.local ?? ""],
        timeOfDay: TIME_OF_DAY[search.timeOfDay ?? ""],
        lighting: SCENE_LIGHTING[search.lighting ?? ""],
        atmosphere: SCENE_ATMOSPHERE[search.atmosphere ?? ""],
        pointOfView:
          PONTOS_DE_VISTA.find((p) => p.id === pontoDeVista)?.enum ?? "SELFIE",
        pose: poseText,
      });

      const session = response.data as CreationSessionDTO;
      if (session.status === "FAILED") {
        throw new Error(
          (session.config?.error as string) ?? "A geração falhou.",
        );
      }
      return session;
    },
    onError: (err) => toast.error(extractError(err, "Erro ao gerar a imagem.")),
  });

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
              if (search.applicationMode)
                params.set("applicationMode", search.applicationMode);
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

        {/* PONTO DE VISTA */}
        <div className="mb-8 rounded-[20px] glass-surface p-5 sm:p-6 border border-white/10">
          <div className="mb-4">
            <h2 className="text-base font-bold text-text-1">Ponto de vista</h2>
            <p className="text-xs text-text-3">
              Como a câmera enquadra a cena.
            </p>
          </div>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {PONTOS_DE_VISTA.map((pov) => {
              const isSelected = pontoDeVista === pov.id;
              const Icon = pov.icon;
              return (
                <button
                  key={pov.id}
                  onClick={() => setPontoDeVista(pov.id)}
                  className={cn(
                    "relative flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all duration-300",
                    isSelected
                      ? "bg-brand-500/10 border-brand-500 shadow-[0_0_20px_-4px_rgba(75,68,232,0.2)]"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
                  )}
                >
                  <div
                    className={cn(
                      "grid size-8 place-items-center rounded-lg",
                      isSelected
                        ? "bg-brand-500/20 text-brand-300"
                        : "bg-white/5 text-text-3",
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span className="text-sm font-semibold text-text-1">
                    {pov.label}
                  </span>
                  <span className="text-[11px] text-text-3 leading-snug">
                    {pov.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CARD PRINCIPAL (Seleção da Pose) */}
        <PoseSelector
          isLoading={loadingSugestoes}
          sugestoes={sugestoes}
          poseSelecionada={poseSelecionada}
          setPoseSelecionada={setPoseSelecionada}
          manualPoseText={manualPoseText}
          setManualPoseText={setManualPoseText}
          isPoseValid={isPoseValid}
          onGenerate={() => generate.mutate()}
          isGenerating={generate.isPending}
          generatedImage={(generate.data?.config?.imageUrl as string) ?? null}
          onRegenerar={() => {
            setJaRegenerou(true);
            refetchSugestoes();
          }}
          podeRegenerar={!jaRegenerou}
          isRegenerando={loadingSugestoes}
        />

        {/* RODAPÉ */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <Button
            variant="ghost"
            onClick={() => {
              const params = new URLSearchParams();
              if (search.productId) params.set("productId", search.productId);
              if (search.avatarId) params.set("avatarId", search.avatarId);
              if (search.applicationMode)
                params.set("applicationMode", search.applicationMode);
              navigate(`/create-from-scratch/scenario?${params.toString()}`);
            }}
            className="text-text-2 hover:text-white"
          >
            Voltar
          </Button>
          <Button
            disabled={!generate.data}
            onClick={() => {
              const params = new URLSearchParams();
              if (search.productId) params.set("productId", search.productId);
              if (search.avatarId) params.set("avatarId", search.avatarId);
              if (search.applicationMode)
                params.set("applicationMode", search.applicationMode);
              if (search.local) params.set("local", search.local);
              if (search.timeOfDay) params.set("timeOfDay", search.timeOfDay);
              if (search.lighting) params.set("lighting", search.lighting);
              if (search.atmosphere)
                params.set("atmosphere", search.atmosphere);
              if (poseSelecionada) params.set("pose", poseSelecionada);
              if (manualPoseText) params.set("manualPose", manualPoseText);
              params.set("pov", pontoDeVista);
              if (generate.data)
                params.set("sessionId", String(generate.data.id));
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
