import { Sparkles } from "lucide-react";

interface GenerationSummaryProps {
  produto?: { name: string };
  avatar?: { name: string };
  search: {
    productId?: string;
    avatarId?: string;
    pose?: string;
    manualPose?: string;
  };
  local: string;
  timeOfDay: string;
}

export function GenerationSummary({ produto, avatar, search, local, timeOfDay }: GenerationSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl glass-surface p-6 border border-white/10 space-y-4">
        <h3 className="text-base font-semibold text-text-1 flex items-center gap-2">
          <Sparkles className="size-4 text-accent-400" />
          Resumo da Geração
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-text-3">Produto</span>
            <span className="text-text-1 font-medium truncate max-w-[150px]">{produto?.name || `#${search.productId}`}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-text-3">Avatar</span>
            <span className="text-text-1 font-medium truncate max-w-[150px]">{avatar?.name || `#${search.avatarId}`}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-text-3">Cenário</span>
            <span className="text-text-1 font-medium">{local} ({timeOfDay})</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-text-3">Pose</span>
            <span className="text-text-1 font-medium truncate max-w-[150px]">{search.pose || search.manualPose || "Padrão"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
