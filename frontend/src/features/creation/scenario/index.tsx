import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeft, ArrowRight, Check, Sun, Sunset, Moon, Sparkles, Lightbulb, Clapperboard, Circle, Flame, Activity, Zap, Gem } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { Page, SectionTitle, Button, Stepper } from "@/components";
import { cn } from "@/utils/utils";
import { toast } from "sonner";

const steps = ["Produto", "Influencer", "Cenário", "Pose + Imagem", "Fala & Voz", "Vídeo"];

// TODO: confirmar o rótulo do 9º item ("Estúdio neutro" ou "Estúdio"), e os slugs de imagem de cada local.
const LOCAIS = [
  { id: "quarto", label: "Quarto", image: "/placeholder-cenario-quarto.jpg" },
  { id: "sala-loft", label: "Sala/Loft", image: "/placeholder-cenario-sala.jpg" },
  { id: "cozinha", label: "Cozinha", image: "/placeholder-cenario-cozinha.jpg" },
  { id: "closet", label: "Closet", image: "/placeholder-cenario-closet.jpg" },
  { id: "home-office", label: "Home office", image: "/placeholder-cenario-office.jpg" },
  { id: "rua-urbana", label: "Rua urbana", image: "/placeholder-cenario-rua.jpg" },
  { id: "cafe", label: "Café", image: "/placeholder-cenario-cafe.jpg" },
  { id: "restaurante", label: "Restaurante", image: "/placeholder-cenario-restaurante.jpg" },
  { id: "estudio", label: "Estúdio neutro", image: "/placeholder-cenario-estudio.jpg" },
  { id: "praia", label: "Praia", image: "/placeholder-cenario-praia.jpg" },
  { id: "parque", label: "Parque", image: "/placeholder-cenario-parque.jpg" },
  { id: "academia", label: "Academia", image: "/placeholder-cenario-academia.jpg" },
];

const HORARIOS = [
  { 
    id: "manha", 
    label: "Manhã", 
    icon: Sun, 
    gradient: "from-yellow-200/20 to-orange-200/10",
    iconColor: "text-yellow-400"
  },
  { 
    id: "meio-dia", 
    label: "Meio-dia", 
    icon: Sun, 
    gradient: "from-cyan-300/20 to-blue-400/10",
    iconColor: "text-cyan-400"
  },
  { 
    id: "fim-de-tarde", 
    label: "Fim de tarde", 
    icon: Sunset, 
    gradient: "from-orange-500/20 to-pink-500/10",
    iconColor: "text-orange-400"
  },
  { 
    id: "noite", 
    label: "Noite", 
    icon: Moon, 
    gradient: "from-brand-900/30 to-blue-900/20",
    iconColor: "text-brand-400"
  },
  { 
    id: "madrugada", 
    label: "Madrugada", 
    icon: Sparkles, 
    gradient: "from-brand-950/40 to-slate-900/40",
    iconColor: "text-brand-400"
  },
];

// TODO: confirmar o rótulo exato desta opção ("Ring light/ideal"?)
const ILUMINACAO = [
  { id: "natural", label: "Natural suave", icon: Lightbulb, gradient: "from-orange-50/70 to-orange-100/30", iconColor: "text-orange-900" },
  { id: "dourada", label: "Dourada forte", icon: Sun, gradient: "from-amber-400/40 to-yellow-500/20", iconColor: "text-amber-500" },
  { id: "neon", label: "Neon/colorida", icon: Sparkles, gradient: "from-brand-500/30 via-blue-500/20 to-pink-500/30", iconColor: "text-pink-400" },
  { id: "cinematografica", label: "Cinematográfica", icon: Clapperboard, gradient: "from-red-900/40 to-rose-900/20", iconColor: "text-red-400" },
  { id: "ring-light", label: "Ring light/ideal", icon: Circle, gradient: "from-slate-100/70 to-white/40", iconColor: "text-slate-800" },
];

const ATMOSFERA = [
  { id: "aconchegante", label: "Aconchegante", icon: Flame, gradient: "from-orange-500/30 to-red-500/20", iconColor: "text-orange-400" },
  { id: "moderada", label: "Moderada", icon: Activity, gradient: "from-slate-200/50 to-slate-300/30", iconColor: "text-slate-800" },
  { id: "vibrante", label: "Vibrante", icon: Zap, gradient: "from-pink-500/30 to-orange-500/20", iconColor: "text-pink-400" },
  { id: "luxuosa", label: "Luxuosa", icon: Gem, gradient: "from-amber-300/30 to-yellow-600/20", iconColor: "text-amber-400" },
];

export function ScenarioScreen() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as any;
  
  // State from URL if navigating back from future steps
  const [localSelecionado, setLocalSelecionado] = useState<string | null>(search.local || null);
  const [timeOfDaySelected, setTimeOfDaySelected] = useState<string | null>(search.timeOfDay || null);
  const [lightingSelected, setLightingSelected] = useState<string | null>(search.lighting || null);
  const [atmosphereSelected, setAtmosphereSelected] = useState<string | null>(search.atmosphere || null);

  const isFormComplete = localSelecionado && timeOfDaySelected && lightingSelected && atmosphereSelected;

  return (
    <AppShell>
      <Page>
        {/* TOPO */}
        <header className="entrance mb-8 flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="bg-white/5 border border-white/10 hover:bg-white/10"
            onClick={() => navigate({ 
              to: "/create-from-scratch", 
              search: (prev: any) => prev // preserva avatarId, productId, etc
            })}
          >
            <ChevronLeft className="size-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-[.2em] text-accent-400">
              Criar do zero
            </span>
            <span className="text-sm font-medium text-text-2">
              Passo 3 de 6
            </span>
          </div>
        </header>

        {/* STEPPER */}
        <Stepper steps={steps} current={2} />

        {/* TÍTULO DA ETAPA */}
        <div className="mt-10 mb-8">
          <h1 className="text-3xl font-extrabold tracking-[-.035em] text-text-1 md:text-4xl">
            Monte o cenário
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-2">
            Escolha uma opção em cada passo abaixo.
          </p>
        </div>

        {/* 1. LOCAL */}
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
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

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

        {/* 2. HORA DO DIA */}
        <div className="mb-10">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-6 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
              2
            </span>
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-text-3">
              Hora do dia
            </h2>
          </div>
          
          <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            {HORARIOS.map((horario) => {
              const isSelected = timeOfDaySelected === horario.id;
              const Icon = horario.icon;
              
              return (
                <button
                  key={horario.id}
                  onClick={() => setTimeOfDaySelected(horario.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl aspect-[16/10] flex flex-col items-center justify-center gap-2 transition-all duration-300",
                    `bg-gradient-to-br ${horario.gradient}`,
                    isSelected
                      ? "ring-2 ring-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.4)]"
                      : "ring-1 ring-white/10 hover:ring-white/20 hover:-translate-y-1 hover:shadow-lg"
                  )}
                >
                  <Icon className={cn("size-6 mb-1 transition-transform group-hover:scale-110", horario.iconColor)} />
                  <span className="font-bold text-white text-xs drop-shadow-md">
                    {horario.label}
                  </span>

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

        {/* 3. ILUMINAÇÃO */}
        <div className="mb-10">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-6 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
              3
            </span>
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-text-3">
              Iluminação
            </h2>
          </div>
          
          <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            {ILUMINACAO.map((item) => {
              const isSelected = lightingSelected === item.id;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setLightingSelected(item.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl aspect-[16/10] flex flex-col items-center justify-center gap-2 transition-all duration-300",
                    `bg-gradient-to-br ${item.gradient}`,
                    isSelected
                      ? "ring-2 ring-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.4)]"
                      : "ring-1 ring-white/10 hover:ring-white/20 hover:-translate-y-1 hover:shadow-lg"
                  )}
                >
                  <Icon className={cn("size-6 mb-1 transition-transform group-hover:scale-110", item.iconColor)} />
                  {/* Para ícones claros (ex.: ring-light), a faixa do label tem fundo escuro por contraste, padrão igual. */}
                  <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 bg-[#0a0810]/50 backdrop-blur-md">
                    <span className="font-bold text-white text-[11px] drop-shadow-md">
                      {item.label}
                    </span>
                  </div>

                  {isSelected && (
                    <>
                      <div className="absolute inset-0 border-2 border-brand-500 rounded-2xl pointer-events-none" />
                      <div className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-brand-500 text-white shadow-sm z-10">
                        <Check className="size-3" />
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. ATMOSFERA */}
        <div className="mb-10">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-6 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
              4
            </span>
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-text-3">
              Atmosfera
            </h2>
          </div>
          
          <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-4">
            {ATMOSFERA.map((item) => {
              const isSelected = atmosphereSelected === item.id;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setAtmosphereSelected(item.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl aspect-[16/10] flex flex-col items-center justify-center gap-2 transition-all duration-300",
                    `bg-gradient-to-br ${item.gradient}`,
                    isSelected
                      ? "ring-2 ring-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.4)]"
                      : "ring-1 ring-white/10 hover:ring-white/20 hover:-translate-y-1 hover:shadow-lg"
                  )}
                >
                  <Icon className={cn("size-6 mb-1 transition-transform group-hover:scale-110", item.iconColor)} />
                  <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 bg-[#0a0810]/50 backdrop-blur-md">
                    <span className="font-bold text-white text-[11px] drop-shadow-md">
                      {item.label}
                    </span>
                  </div>

                  {isSelected && (
                    <>
                      <div className="absolute inset-0 border-2 border-brand-500 rounded-2xl pointer-events-none" />
                      <div className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-brand-500 text-white shadow-sm z-10">
                        <Check className="size-3" />
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* BARRA DE RESUMO */}
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

        {/* RODAPÉ */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <Button 
            variant="ghost"
            onClick={() => navigate({ 
              to: "/create-from-scratch",
              search: (prev: any) => prev
            })}
            className="text-text-2 hover:text-white"
          >
            Voltar
          </Button>
          <Button
            disabled={!isFormComplete}
            onClick={() => {
              // TODO: etapa Pose + Imagem
              toast("Em breve: Etapa Pose + Imagem");
              navigate({
                to: "/create-from-scratch/pose" as any,
                search: (prev: any) => ({
                  ...prev,
                  local: localSelecionado,
                  timeOfDay: timeOfDaySelected,
                  lighting: lightingSelected,
                  atmosphere: atmosphereSelected
                })
              }).catch(() => {}); // catch error due to route not existing yet
            }}
          >
            Próximo
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      </Page>
    </AppShell>
  );
}
