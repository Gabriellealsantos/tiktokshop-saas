import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Copy, Download, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/layouts/app-shell";
import { Page, Button, Stepper } from "@/components";
import { getStudioSession } from "@/services/studioService";
import { downloadStorageFile } from "@/services/avatarService";
import type { CreationSessionDTO } from "@/models/studio";

const steps = [
  "Produto",
  "Influencer",
  "Cenário",
  "Pose + Imagem",
  "Fala & Voz",
  "Vídeo",
];
const FLOW_URL = "https://labs.google/flow";

export default function VideoScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [copied, setCopied] = useState(false);

  const { data: session, isLoading } = useQuery({
    queryKey: ["studio-session", sessionId],
    queryFn: async () => {
      const response = await getStudioSession(Number(sessionId));
      return response.data as CreationSessionDTO;
    },
    enabled: !!sessionId,
  });

  const imageUrl = session?.config?.imageUrl as string | undefined;
  const videoPrompt = session?.config?.videoPrompt as string | undefined;

  const copyPrompt = async () => {
    if (!videoPrompt) return;
    await navigator.clipboard.writeText(videoPrompt);
    setCopied(true);
    toast.success("Prompt copiado.");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = async () => {
    if (!imageUrl) return;
    try {
      const response = await downloadStorageFile(imageUrl, "cena.jpg");
      const objectUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "cena.jpg";
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error("Não foi possível baixar a imagem.");
    }
  };

  return (
    <AppShell>
      <Page>
        <header className="entrance mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            className="bg-white/5 border border-white/10 hover:bg-white/10"
            onClick={() =>
              navigate(`/create-from-scratch/speech?${searchParams.toString()}`)
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
              Passo 6 de 6
            </span>
          </div>
        </header>

        <Stepper steps={steps} current={5} />

        <div className="mt-10 mb-8">
          <h1 className="text-3xl font-extrabold tracking-[-.035em] text-text-1 md:text-4xl">
            Tudo pronto para o Flow
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-2">
            Baixe a imagem, copie o prompt e abra o Google Flow para gerar o
            vídeo.
          </p>
        </div>

        {isLoading ? (
          <p className="text-text-3 text-sm">Carregando…</p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[320px_1fr] items-start">
            {/* IMAGEM */}
            <div className="space-y-3">
              {imageUrl && (
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={imageUrl}
                    alt="Imagem gerada"
                    className="w-full h-auto"
                  />
                </div>
              )}
              <Button
                variant="outline"
                onClick={downloadImage}
                className="w-full rounded-xl bg-surface-2 border-white/10 hover:bg-white/10 h-11"
              >
                <Download className="size-4 mr-2" />
                Baixar imagem
              </Button>
            </div>

            {/* PROMPT */}
            <div className="space-y-4">
              <div className="rounded-2xl glass-surface border border-white/10 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-text-1">
                    Prompt do vídeo (para o Flow)
                  </h2>
                  <Button
                    size="sm"
                    onClick={copyPrompt}
                    className="btn-brand rounded-lg"
                  >
                    {copied ? (
                      <Check className="size-4 mr-1" />
                    ) : (
                      <Copy className="size-4 mr-1" />
                    )}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                </div>
                <p className="max-h-[320px] overflow-y-auto rounded-xl bg-surface-2 border border-white/10 p-4 text-sm leading-relaxed text-text-2 whitespace-pre-wrap">
                  {videoPrompt || "Prompt não disponível."}
                </p>
              </div>

              <Button
                asChild
                className="btn-brand w-full h-12 rounded-xl font-semibold"
              >
                <a href={FLOW_URL} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4 mr-2" />
                  Abrir Google Flow
                </a>
              </Button>
            </div>
          </div>
        )}
      </Page>
    </AppShell>
  );
}
