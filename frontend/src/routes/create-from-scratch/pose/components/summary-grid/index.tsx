import { useState } from "react";
import { Package, User, Camera, Image as ImageIcon } from "lucide-react";

interface SummaryGridProps {
  produto?: { name: string; image?: string };
  avatar?: { name: string; image?: string };
  local: string;
  timeOfDay: string;
  lighting: string;
  atmosphere: string;
}

export function SummaryGrid({
  produto,
  avatar,
  local,
  timeOfDay,
  lighting,
  atmosphere,
}: SummaryGridProps) {
  const [productImgError, setProductImgError] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);

  return (
    <div className="mb-10 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex items-center gap-3 rounded-2xl glass-surface p-4 border border-white/10 min-w-0">
        {produto?.image && !productImgError ? (
          <img
            src={produto.image}
            alt={produto.name}
            className="size-10 shrink-0 rounded-xl object-cover border border-white/12 shadow-sm"
            onError={() => setProductImgError(true)}
          />
        ) : (
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-400">
            <Package className="size-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-3">
            Produto
          </p>
          <p className="text-sm font-medium text-text-1 truncate">
            {produto?.name || "Desconhecido"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl glass-surface p-4 border border-white/10 min-w-0">
        {avatar?.image && !avatarImgError ? (
          <img
            src={avatar.image}
            alt={avatar.name}
            className="size-10 shrink-0 rounded-xl object-cover border border-white/12 shadow-sm"
            onError={() => setAvatarImgError(true)}
          />
        ) : (
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-400">
            <User className="size-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-3">
            Influencer
          </p>
          <p className="text-sm font-medium text-text-1 truncate">
            {avatar?.name || "Desconhecido"} (padrão)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl glass-surface p-4 border border-white/10 min-w-0">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-400">
          <Camera className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-3">
            Ponto de Vista
          </p>
          {/* TODO: origem do "ponto de vista" — se ainda não é escolhido em nenhuma etapa, definir default ou etapa de origem */}
          <p className="text-sm font-medium text-text-1 truncate">
            Selfie (POV)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl glass-surface p-4 border border-white/10 min-w-0">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-400">
          <ImageIcon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-3">
            Cenário
          </p>
          <p className="text-sm font-medium text-text-1 truncate">
            {local} · {timeOfDay} · {lighting} · {atmosphere}
          </p>
        </div>
      </div>
    </div>
  );
}
