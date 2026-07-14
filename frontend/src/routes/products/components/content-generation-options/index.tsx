import { Flame, ArrowRight, WandSparkles } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Product } from "@/services/data";

interface ContentGenerationOptionsProps {
  product: Product;
  onNavigate: () => void;
}

export function ContentGenerationOptions({ product, onNavigate }: ContentGenerationOptionsProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div>
        <h3 className="text-base font-bold text-text-1">Gere conteúdo com este produto de duas formas</h3>
        <p className="text-sm text-text-3 mt-0.5">Escolha o caminho ideal para criar seu vídeo</p>
      </div>

      <button
        className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-surface-2 p-4 text-left transition-all hover:border-white/10 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-12px_rgba(75,68,232,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
        onClick={() => {
          onNavigate();
          const params = new URLSearchParams(searchParams);
          params.set("productId", String(product.id));
          navigate(`/generate/viral-template?${params.toString()}`);
        }}
      >
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-500 transition-colors group-hover:bg-orange-500/20">
          <Flame className="size-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-text-1 transition-colors group-hover:text-white">Gerar conteúdo a partir de um modelo viral</h4>
          <p className="mt-1 text-xs text-text-3 leading-relaxed">Use um template testado e adapte ao seu produto.</p>
        </div>
        <ArrowRight className="size-5 text-text-3 transition-transform group-hover:translate-x-1 group-hover:text-white" />
      </button>

      <button
        className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-surface-2 p-4 text-left transition-all hover:border-white/10 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-12px_rgba(75,68,232,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
        onClick={() => {
          onNavigate();
          const params = new URLSearchParams();
          params.set("productId", String(product.id));
          const avatarId = searchParams.get("avatarId");
          const applicationMode = searchParams.get("applicationMode");
          if (avatarId) params.set("avatarId", avatarId);
          if (applicationMode) params.set("applicationMode", applicationMode);
          navigate(`/create-from-scratch?${params.toString()}`);
        }}
      >
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-400 transition-colors group-hover:bg-brand-500/20">
          <WandSparkles className="size-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-text-1 transition-colors group-hover:text-white">Gerar conteúdo com criação do zero</h4>
          <p className="mt-1 text-xs text-text-3 leading-relaxed">Monte cada conteúdo manualmente para máximo controle.</p>
        </div>
        <ArrowRight className="size-5 text-text-3 transition-transform group-hover:translate-x-1 group-hover:text-white" />
      </button>
    </div>
  );
}
