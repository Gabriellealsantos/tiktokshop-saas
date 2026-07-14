import { LOCAIS, HORARIOS, ILUMINACAO, ATMOSFERA } from "../../data";

interface SummaryBarProps {
  localSelecionado: string | null;
  timeOfDaySelected: string | null;
  lightingSelected: string | null;
  atmosphereSelected: string | null;
}

export function SummaryBar({ localSelecionado, timeOfDaySelected, lightingSelected, atmosphereSelected }: SummaryBarProps) {
  return (
    <div className="mb-6 rounded-2xl glass-surface p-4 border border-white/10 flex flex-wrap items-center gap-2 text-sm text-text-2">
      <span className="font-bold text-text-1 mr-1">Seleção atual:</span>
      <span>{localSelecionado ? LOCAIS.find(l => l.id === localSelecionado)?.label : "-"}</span>
      <span className="text-white/20">|</span>
      <span>{timeOfDaySelected ? HORARIOS.find(h => h.id === timeOfDaySelected)?.label : "-"}</span>
      <span className="text-white/20">|</span>
      <span>{lightingSelected ? ILUMINACAO.find(i => i.id === lightingSelected)?.label : "-"}</span>
      <span className="text-white/20">|</span>
      <span>{atmosphereSelected ? ATMOSFERA.find(a => a.id === atmosphereSelected)?.label : "-"}</span>
    </div>
  );
}
