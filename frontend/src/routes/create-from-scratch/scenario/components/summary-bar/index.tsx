import { LOCAIS, HORARIOS, ILUMINACAO, ATMOSFERA } from "../../data";
import { Sparkles, MapPin, Clock, Sun, Cloud } from "lucide-react";

interface SummaryBarProps {
  localSelecionado: string | null;
  timeOfDaySelected: string | null;
  lightingSelected: string | null;
  atmosphereSelected: string | null;
}

export function SummaryBar({ localSelecionado, timeOfDaySelected, lightingSelected, atmosphereSelected }: SummaryBarProps) {
  const local = localSelecionado ? LOCAIS.find(l => l.id === localSelecionado)?.label : null;
  const time = timeOfDaySelected ? HORARIOS.find(h => h.id === timeOfDaySelected)?.label : null;
  const lighting = lightingSelected ? ILUMINACAO.find(i => i.id === lightingSelected)?.label : null;
  const atmosphere = atmosphereSelected ? ATMOSFERA.find(a => a.id === atmosphereSelected)?.label : null;

  return (
    <div className="mb-8 rounded-[24px] bg-[linear-gradient(135deg,rgba(75,68,232,0.15)_0%,rgba(15,14,35,0.45)_50%,rgba(75,68,232,0.05)_100%)] p-4 sm:p-6 border border-brand-500/35 shadow-[0_12px_36px_-10px_rgba(75,68,232,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-2xl bg-[linear-gradient(135deg,rgba(75,68,232,0.35)_0%,rgba(75,68,232,0.10)_100%)] border border-brand-400/40 flex items-center justify-center text-brand-300 shadow-[0_0_15px_-3px_rgba(75,68,232,0.5)] shrink-0">
          <Sparkles className="size-5 animate-pulse" />
        </div>
        <div>
          <span className="font-extrabold text-white text-base tracking-tight block">Seleção atual</span>
          <span className="text-xs text-zinc-400 font-medium">Parâmetros definidos em tempo real para o seu cenário</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full md:w-auto pt-2 md:pt-0 border-t border-white/10 md:border-0">
        {local ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-white border border-white/15 shadow-xs font-bold text-xs transition-transform duration-200 hover:scale-105">
            <MapPin className="size-3.5 text-brand-300 shrink-0" />
            <span>{local}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 text-zinc-500 border border-white/5 text-xs font-medium">
            <span>Sem local</span>
          </div>
        )}

        {time && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-white border border-white/15 shadow-xs font-bold text-xs transition-transform duration-200 hover:scale-105">
            <Clock className="size-3.5 text-amber-300 shrink-0" />
            <span>{time}</span>
          </div>
        )}

        {lighting && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[linear-gradient(135deg,rgba(75,68,232,0.35)_0%,rgba(75,68,232,0.15)_100%)] text-white border border-brand-400/50 shadow-[0_0_20px_-4px_rgba(75,68,232,0.6)] font-extrabold text-xs transition-transform duration-200 hover:scale-105">
            <Sun className="size-3.5 text-yellow-300 shrink-0 animate-pulse" />
            <span>{lighting}</span>
          </div>
        )}

        {atmosphere && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-white border border-white/15 shadow-xs font-bold text-xs transition-transform duration-200 hover:scale-105">
            <Cloud className="size-3.5 text-sky-300 shrink-0" />
            <span>{atmosphere}</span>
          </div>
        )}
      </div>
    </div>
  );
}
