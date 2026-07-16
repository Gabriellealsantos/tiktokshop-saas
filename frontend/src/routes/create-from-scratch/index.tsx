import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Shirt, Filter, Wand, ArrowRight, Check } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { Page, Button, Stepper } from "@/components";
import { avatars } from "@/data/mock";
import { cn } from "@/utils/utils";
import { toast } from "sonner";

const steps = ["Produto", "Influencer", "Cenário", "Pose + Imagem", "Fala & Voz", "Vídeo"];

// Mock de aplicação de produto
const MOCK_MODOS_APLICACAO = [
  {
    id: "vestindo",
    title: "Vestindo (camisa)",
    description: "A peça aparece no corpo do avatar. Mãos livres.",
  },
  // TODO: demais modos de aplicação (ex.: segurando a peça), se existirem
];

export default function CreateFromScratchScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const avatarIdParam = searchParams.get("avatarId") ?? undefined;
  const applicationModeParam = searchParams.get("applicationMode") ?? undefined;
  const [applicationMode, setApplicationMode] = useState(applicationModeParam || MOCK_MODOS_APLICACAO[0].id);
  const [somenteNeutros, setSomenteNeutros] = useState(false);
  const [avatarSelecionado, setAvatarSelecionado] = useState<number | null>(avatarIdParam ? Number(avatarIdParam) : null);

  // TODO: campo/flag "neutro" no avatar. Usando um mock temporário
  // Aqui assumimos que alguns avatares poderiam ser neutros,
  // mas como o dado original não tem essa flag, vamos fingir que os "Modelo IA" são neutros para demonstração
  const avataresFiltrados = avatars.filter(
    (a) => !somenteNeutros || a.gender === "Modelo IA"
  );

  return (
    <AppShell>
      <Page>
        {/* TOPO */}
        <header className="entrance mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            className="bg-white/5 border border-white/10 hover:bg-white/10"
            onClick={() => navigate("/")}
          >
            <ChevronLeft className="size-4 mr-2" />
            Voltar
          </Button>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-[.2em] text-accent-400">
              Criar do zero
            </span>
            <span className="text-sm font-medium text-text-2">
              Passo 2 de 6
            </span>
          </div>
        </header>

        {/* STEPPER */}
        <Stepper steps={steps} current={1} />

        {/* TÍTULO DA ETAPA */}
        <div className="mt-10 mb-8">
          <h1 className="text-3xl font-extrabold tracking-[-.035em] text-text-1 md:text-4xl">
            Influencer
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-2">
            Escolha o avatar que vai aparecer na cena.
          </p>
        </div>

        {/* CARD COMO O AVATAR USA A PEÇA */}
        <div className="mb-10 rounded-[20px] glass-surface p-5 sm:p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="grid size-10 place-items-center rounded-xl bg-brand-500/15 text-brand-400">
              <Shirt className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-1 leading-tight">Como o avatar usa a peça?</h2>
              <p className="text-xs text-text-3">Escolha o modo de aplicação.</p>
            </div>
          </div>

          {/* Opções de aplicação (single-select) */}
          <div className="grid gap-3 sm:grid-cols-2 mb-6">
            {MOCK_MODOS_APLICACAO.map((modo) => {
              const isSelected = applicationMode === modo.id;
              return (
                <button
                  key={modo.id}
                  onClick={() => setApplicationMode(modo.id)}
                  className={cn(
                    "relative flex flex-col items-start gap-1 p-4 rounded-2xl border text-left transition-all duration-300",
                    isSelected
                      ? "bg-brand-500/10 border-brand-500 shadow-[0_0_20px_-4px_rgba(75,68,232,0.2)]"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  )}
                >
                  <span className="font-semibold text-text-1">{modo.title}</span>
                  <span className="text-xs text-text-3 leading-relaxed">{modo.description}</span>
                  {isSelected && (
                    <div className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-brand-500 text-white shadow-sm">
                      <Check className="size-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-white/5">
            <button
              onClick={() => setSomenteNeutros(!somenteNeutros)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                somenteNeutros
                  ? "bg-brand-500/20 border-brand-500/30 text-brand-300"
                  : "bg-white/5 border-white/10 text-text-2 hover:bg-white/10 hover:text-white"
              )}
            >
              <Filter className="size-4" />
              Somente neutros
            </button>
            <button
              onClick={() => {
                // TODO: ação de gerar variante neutra
                toast("Em breve: Gerar variante neutra");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-white/10 bg-surface-2 text-text-1 hover:bg-surface-3 transition-colors shadow-sm"
            >
              <Wand className="size-4 text-brand-400" />
              Gerar variante neutra
            </button>
          </div>
        </div>

        {/* 2. INFLUENCER GRID */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-3">
            2. Influencer
          </span>
        </div>

        {avataresFiltrados.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center rounded-[20px] border border-white/5 border-dashed bg-white/[0.02]">
            <p className="text-text-3 text-sm">Nenhum avatar encontrado.</p>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mb-12">
            {avataresFiltrados.map((avatar) => {
              const isSelected = avatarSelecionado === avatar.id;
              // Simulando flag neutro
              const isNeutro = avatar.gender === "Modelo IA";

              return (
                <button
                  key={avatar.id}
                  onClick={() => setAvatarSelecionado(avatar.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl aspect-[2/3] text-left transition-all duration-300",
                    isSelected
                      ? "ring-2 ring-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.5)]"
                      : "ring-1 ring-white/10 hover:ring-white/20 hover:-translate-y-1 hover:shadow-lg"
                  )}
                >
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {isNeutro && (
                    <div className="absolute top-2 left-2 z-10 pointer-events-none rounded-full bg-[#0a0810]/50 backdrop-blur-md border border-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">
                      Neutro
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                    <p className="font-bold text-white text-sm drop-shadow-md truncate">
                      {avatar.name}
                    </p>
                    <p className="text-[10px] text-white/70 truncate">
                      {/* TODO: variação real do sistema se houver */}
                      outfit padrão
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-brand-500 rounded-2xl pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* RODAPÉ */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")} // Voltando ao suposto modal inicial (Home)
            className="text-text-2 hover:text-white"
          >
            Voltar
          </Button>
          <Button
            disabled={!avatarSelecionado}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              if (avatarSelecionado !== null) params.set("avatarId", String(avatarSelecionado));
              params.set("applicationMode", applicationMode);
              navigate(`/create-from-scratch/scenario?${params.toString()}`);
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
