import { Options } from "../options";
import { AudioStep } from "../step-audio";

export function PovStep({
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
        title="Cenário POV"
        items={[
          "Bancada de Mármore",
          "Setup Gamer",
          "Mesa de Escritório",
          "Closet Maquiagem",
          "Unboxing Madeira",
          "Personalizado",
        ]}
      />
      <Options
        title="Aparência das mãos"
        items={["Natural Feminina", "Natural Masculina", "Luvas", "Sem Mãos"]}
      />
      <Options title="Cor da mão" items={["Clara", "Morena", "Escura"]} />
      <Options title="Apresentação" items={["Textura", "Acabamento", "Premium", "Demonstração"]} />
    </div>
  ) : (
    <AudioStep takes={takes} setTakes={setTakes} />
  );
}
