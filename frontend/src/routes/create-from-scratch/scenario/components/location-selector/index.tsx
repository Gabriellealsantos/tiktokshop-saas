import { Check } from "lucide-react";
import { cn } from "@/utils/utils";
import { LOCAIS } from "../../data";

interface LocalSelectorProps {
  localSelecionado: string | null;
  setLocalSelecionado: (id: string) => void;
}

export function LocalSelector({ localSelecionado, setLocalSelecionado }: LocalSelectorProps) {
  return (
    <div className="mb-10">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-6 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
          1
        </span>
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-text-3">
          Local
        </h2>
      </div>

      <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {LOCAIS.map((local) => {
          const isSelected = localSelecionado === local.id;

          return (
            <button
              key={local.id}
              onClick={() => setLocalSelecionado(local.id)}
              className={cn(
                "group relative overflow-hidden rounded-2xl aspect-[16/10] text-left transition-all duration-300",
                isSelected
                  ? "ring-2 ring-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.5)]"
                  : "ring-1 ring-white/10 hover:ring-white/20 hover:-translate-y-1 hover:shadow-lg"
              )}
            >
              <img
                src={local.image}
                alt={local.label}
                loading="lazy"
                // Evita imagem quebrada, fallback via bg-color css (abaixo)
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0';
                }}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Fundo fallback se a imagem quebrar */}
              <div className="absolute inset-0 bg-surface-3 -z-10" />

              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <p className="font-bold text-white text-sm drop-shadow-md truncate">
                  {local.label}
                </p>
              </div>

              {isSelected && (
                <>
                  <div className="absolute inset-0 border-2 border-brand-500 rounded-2xl pointer-events-none" />
                  <div className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-brand-500 text-white shadow-sm">
                    <Check className="size-3" />
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
