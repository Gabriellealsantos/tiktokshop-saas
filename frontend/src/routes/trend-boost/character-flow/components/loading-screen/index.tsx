import { Page, PremiumLoading } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { Sparkles } from "lucide-react";
import type { ViralCharacter } from "@/models/viral";

interface LoadingScreenProps {
  character: ViralCharacter;
  loadingStage: number; // Mantido para compatibilidade com o pai, mesmo não sendo usado diretamente pelo PremiumLoading
}

export function LoadingScreen({ character }: LoadingScreenProps) {
  return (
    <AppShell>
      <Page className="pt-0 flex flex-col pb-12 mt-4">
        <PremiumLoading
          imageSrc={character.imageUrl ?? undefined}
          badgeText="Trend AI"
          badgeIcon={<Sparkles className="size-3.5" />}
          mainTitle={
            <>
              Montando o roteiro de{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(120deg, var(--brand-300) 0%, var(--brand-500) 100%)",
                }}
              >
                {character.name}
              </span>
            </>
          }
          mainDescription="A IA está estruturando cena, ritmo e fala em inglês cinematográfico."
          loadingTitle="Gerando o roteiro viral"
          loadingSubtitle="Preparando o conteúdo de alta conversão para o seu personagem."
          loadingSteps={[
            "Analisando referência visual",
            "Compondo direção de cena",
            "Refinando fala e timing",
          ]}
        />
      </Page>
    </AppShell>
  );
}
