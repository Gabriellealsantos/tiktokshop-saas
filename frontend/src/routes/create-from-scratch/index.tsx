import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { Page, Button, Stepper } from "@/components";
import {
  useMyAvatars,
  useGalleryAvatars,
} from "@/routes/create-avatar/api/use-avatars";

import { cn } from "@/utils/utils";

const steps = [
  "Produto",
  "Influencer",
  "Cenário",
  "Pose + Imagem",
  "Fala & Voz",
  "Vídeo",
];

export default function CreateFromScratchScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: myAvatars } = useMyAvatars();
  const { data: gallery } = useGalleryAvatars();

  const avatarIdParam = searchParams.get("avatarId") ?? undefined;

  const [avatarSelecionado, setAvatarSelecionado] = useState<string | null>(
    avatarIdParam ?? null,
  );

  // TODO: campo/flag "neutro" no avatar. Usando um mock temporário
  // Aqui assumimos que alguns avatares poderiam ser neutros,
  // mas como o dado original não tem essa flag, vamos fingir que os "Modelo IA" são neutros para demonstração
  const avatares = [
    ...(myAvatars?.items ?? []).map((a) => ({
      id: `u${a.id}`,
      name: a.name,
      image: a.imageUrl,
      isNeutro: false,
    })),
    ...(gallery ?? []).map((a) => ({
      id: `g${a.id}`,
      name: a.name,
      image: a.imageUrl,
      isNeutro: true,
    })),
  ];

  const avataresFiltrados = avatares;

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
              const isNeutro = avatar.isNeutro;

              return (
                <button
                  key={avatar.id}
                  onClick={() => setAvatarSelecionado(avatar.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl aspect-[2/3] text-left transition-all duration-300",
                    isSelected
                      ? "ring-2 ring-brand-500 shadow-[0_0_24px_-4px_rgba(75,68,232,0.5)]"
                      : "ring-1 ring-white/10 hover:ring-white/20 hover:-translate-y-1 hover:shadow-lg",
                  )}
                >
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

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
              if (avatarSelecionado !== null)
                params.set("avatarId", String(avatarSelecionado));
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
