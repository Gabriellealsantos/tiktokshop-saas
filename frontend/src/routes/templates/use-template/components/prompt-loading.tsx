import { PremiumLoading } from "@/components";

interface PromptLoadingProps {
  imageSrc?: string | null;
}

export function PromptLoading({ imageSrc }: PromptLoadingProps) {
  return (
    <PremiumLoading
      imageSrc={imageSrc}
      badgeText="Inteligência Viral"
      mainTitle="Replique movimentos de qualquer vídeo viral"
      mainDescription="Escolha um modelo, a IA captura o melhor frame, troca a pessoa pelo seu avatar e gera um prompt pronto para usar em qualquer ferramenta de geração de vídeo."
      loadingTitle="Gerando prompt de movimento"
      loadingSubtitle="Estamos preparando o prompt cinematográfico e a imagem final."
      loadingSteps={[
        "Analisando video",
        "Alinhando movimentos do Influencer",
        "Replicando cenario",
        "Gerando prompt",
      ]}
    />
  );
}
