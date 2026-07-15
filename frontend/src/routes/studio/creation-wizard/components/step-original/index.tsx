import { SectionTitle } from "@/components";
import { scenarios } from "@/utils/constants";
import { AvatarGrid } from "../avatar-grid";
import { Options } from "../options";
import { AudioStep } from "../step-audio";

export function OriginalStep({
  step,
  takes,
  setTakes,
}: {
  step: number;
  takes: number;
  setTakes: (v: number) => void;
}) {
  return step === 1 ? (
    <div className="space-y-7">
      <Options
        title="Estilo de câmera"
        items={["De Frente", "Mais Próximo", "Corpo Completo", "Automático"]}
      />
      <SectionTitle
        title="Influenciador"
        description="Mulheres · Homens · Modelos IA · Meus Avatares"
      />
      <AvatarGrid />
      <Options title="Cenário" items={scenarios} />
      <Options
        title="Estilo do vídeo"
        items={["UGC Natural", "Hook TikTok", "Mostrar o Produto", "Review"]}
      />
      <Options title="Energia" items={["Natural", "Mais Expressivo", "Mais Discreto"]} />
    </div>
  ) : (
    <AudioStep takes={takes} setTakes={setTakes} />
  );
}
