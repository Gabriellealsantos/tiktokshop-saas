import { useState } from "react";
import {
  Library,
  SlidersHorizontal,
  UserPlus,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/layouts/app-shell";
import { Page, PageHeader, Button } from "@/components";
import { cn } from "@/utils/utils";
import { FullCustomizationMode } from "./components/full-customization-mode";
import { PhotoCustomizationMode } from "./components/photo-customization-mode";
import { AvatarLibraryModal } from "./components/avatar-library-modal";

type CreationMode = "full" | "photo";

export default function AvatarStudio() {
  const [mode, setMode] = useState<CreationMode>("full");

  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Influencers"
          title="Crie seu Influencer de IA"
          description="Personalize cada detalhe — aparência, estilo e personalidade. O influencer será usado em suas gerações de imagem e vídeo."
          actions={
            <div className="flex flex-col sm:flex-row gap-3">
              <AvatarLibraryModal>
                <Button
                  variant="default"
                  className="btn-brand cursor-pointer font-bold rounded-xl h-10 px-4"
                >
                  <Library className="size-4 mr-2" />
                  Biblioteca
                  <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                    12
                  </span>
                </Button>
              </AvatarLibraryModal>
            </div>
          }
        />

        <div className="mt-8 flex flex-col gap-8">
          {/* SELETOR DE MODO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setMode("full")}
              className={cn(
                "group relative flex flex-col items-start gap-1 overflow-hidden rounded-[20px] p-4 text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                mode === "full"
                  ? "btn-brand"
                  : "bg-white/[0.015] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.10] backdrop-blur-sm",
              )}
            >
              <div className="flex w-full items-center justify-between mb-1">
                <div
                  className={cn(
                    "grid size-8 place-items-center rounded-full transition-colors",
                    mode === "full"
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-brand-400 group-hover:bg-brand-500/10 group-hover:text-brand-300",
                  )}
                >
                  <SlidersHorizontal className="size-4" />
                </div>
                {mode === "full" && (
                  <Sparkles className="size-4 text-white/50" />
                )}
              </div>
              <h3
                className={cn(
                  "text-base font-bold transition-colors",
                  mode === "full" ? "text-white" : "text-text-1",
                )}
              >
                Personalização completa
              </h3>
              <p
                className={cn(
                  "text-xs transition-colors",
                  mode === "full" ? "text-white/80" : "text-text-2",
                )}
              >
                Defina cada característica em etapas
              </p>
            </button>

            <button
              onClick={() => setMode("photo")}
              className={cn(
                "group relative flex flex-col items-start gap-1 overflow-hidden rounded-[20px] p-4 text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                mode === "photo"
                  ? "btn-brand"
                  : "bg-white/[0.015] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.10] backdrop-blur-sm",
              )}
            >
              <div className="flex w-full items-center justify-between mb-1">
                <div
                  className={cn(
                    "grid size-8 place-items-center rounded-full transition-colors",
                    mode === "photo"
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-brand-400 group-hover:bg-brand-500/10 group-hover:text-brand-300",
                  )}
                >
                  <UserPlus className="size-4" />
                </div>
                {mode === "photo" && (
                  <Sparkles className="size-4 text-white/50" />
                )}
              </div>
              <h3
                className={cn(
                  "text-base font-bold transition-colors",
                  mode === "photo" ? "text-white" : "text-text-1",
                )}
              >
                Criar a partir de foto
              </h3>
              <p
                className={cn(
                  "text-xs transition-colors",
                  mode === "photo" ? "text-white/80" : "text-text-2",
                )}
              >
                Envie uma selfie — o avatar fica igual a você
              </p>
            </button>
          </div>
          {/* MODO ATIVO */}
          {mode === "full" ? (
            <FullCustomizationMode />
          ) : (
            <PhotoCustomizationMode />
          )}
        </div>
      </Page>
    </AppShell>
  );
}
