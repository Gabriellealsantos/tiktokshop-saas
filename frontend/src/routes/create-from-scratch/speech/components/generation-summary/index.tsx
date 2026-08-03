import { Sparkles } from "lucide-react";
import {
  LOCATION_LABEL,
  TIME_LABEL,
  type CreationSessionDTO,
} from "@/models/studio";

interface GenerationSummaryProps {
  session?: CreationSessionDTO;
}

export function GenerationSummary({ session }: GenerationSummaryProps) {
  const config = session?.config ?? {};

  const productName = (config.productName as string) || "—";
  const avatarImageUrl = config.avatarImageUrl as string | undefined;
  const imageUrl = config.imageUrl as string | undefined;
  const pose = (config.pose as string) || "—";

  const location = LOCATION_LABEL[config.location as string] || "";
  const timeOfDay = TIME_LABEL[config.timeOfDay as string] || "";
  const cenario = [location, timeOfDay].filter(Boolean).join(" · ") || "—";

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-[linear-gradient(180deg,hsl(255_100%_95%/0.02),hsl(258_90%_70%/0.008))] backdrop-blur-sm border border-white/10 ring-1 ring-inset ring-white/[0.06] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10)] p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-semibold text-text-1 flex items-center gap-2">
          <Sparkles className="size-4 text-accent-400" />
          Resumo da Geração
        </h3>

        {imageUrl && (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <img src={imageUrl} alt="Imagem gerada" className="w-full h-auto" />
          </div>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/5 pb-2 gap-3">
            <span className="text-text-3 shrink-0">Produto</span>
            <span className="text-text-1 font-medium truncate">
              {productName}
            </span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2 gap-3 items-center">
            <span className="text-text-3 shrink-0">Avatar</span>
            {avatarImageUrl ? (
              <img
                src={avatarImageUrl}
                alt="Avatar"
                className="size-8 rounded-lg object-cover border border-white/10"
              />
            ) : (
              <span className="text-text-1 font-medium">—</span>
            )}
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2 gap-3">
            <span className="text-text-3 shrink-0">Cenário</span>
            <span className="text-text-1 font-medium truncate">{cenario}</span>
          </div>
          <div className="flex flex-col gap-1 pb-2">
            <span className="text-text-3">Pose</span>
            <span className="text-text-1 font-medium text-right leading-snug">
              {pose}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
