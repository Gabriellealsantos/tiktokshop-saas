import { SectionTitle } from "@/components";
import { scenarios } from "@/utils/constants";
import { AvatarGrid } from "../avatar-grid";
import { Options } from "../options";

export function CinemaStep({ step }: { step: number }) {
  if (step === 1)
    return (
      <div>
        <SectionTitle
          title="Influenciador Digital"
          description="Influencer Studio · Meus Avatares"
        />
        <AvatarGrid />
      </div>
    );
  if (step === 2)
    return (
      <div className="space-y-7">
        <Options
          title="Interação"
          items={[
            "Vestindo o produto",
            "Segurando o produto",
            "Selfie no espelho",
            "Selfie natural",
          ]}
        />
        <Options title="Cenário" items={scenarios.slice(0, 8)} />
        <Options
          title="Pose"
          items={["De Frente", "De Lado", "Ângulo 3/4", "Sentado(a)", "Andando", "Personalizado"]}
        />
      </div>
    );
  return (
    <Options
      title="Template de movimento"
      items={["CTA", "Movimentos Naturais", "Exibição de Produto"]}
    />
  );
}
