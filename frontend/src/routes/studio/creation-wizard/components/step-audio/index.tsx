import { SectionTitle, TakeEditor, TakesSelector, VoiceConfig } from "@/components";

export function AudioStep({ takes, setTakes }: { takes: number; setTakes: (v: number) => void }) {
  return (
    <div className="space-y-7">
      <div>
        <SectionTitle title="Duração por takes" />
        <TakesSelector value={takes} onChange={setTakes} />
      </div>
      <div>
        <SectionTitle title="Configuração de voz" />
        <VoiceConfig />
      </div>
      <div>
        <SectionTitle
          title="Fala por take"
          description="Até 20 palavras por take para melhor ritmo."
        />
        <TakeEditor count={takes} />
      </div>
    </div>
  );
}
