import { Flame, ArrowRight, WandSparkles } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Product } from "@/models/product";

interface ContentGenerationOptionsProps {
  product: Product;
  onNavigate: () => void;
}

export function ContentGenerationOptions({ product, onNavigate }: ContentGenerationOptionsProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <div className="mt-4.5 flex flex-col gap-2.5">
      <div>
        <h3 className="text-base font-extrabold text-white tracking-tight drop-shadow-xs">
          Gere conteúdo com este produto de duas formas
        </h3>
      </div>

      {/* Option 1: Modelo Viral -> Ultra-transparent glassmorphism */}
      <button
        className="group relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-left transition-all duration-200 backdrop-blur-sm hover:border-orange-500/50 hover:bg-white/[0.06] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(249,115,22,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 overflow-hidden cursor-pointer w-full"
        onClick={() => {
          onNavigate();
          const params = new URLSearchParams(searchParams);
          params.set("productId", String(product.id));
          navigate(`/generate/viral-template?${params.toString()}`);
        }}
      >
        <div className="absolute top-0 right-0 w-48 h-full bg-linear-to-l from-orange-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500/25 group-hover:shadow-[0_0_16px_rgba(249,115,22,0.5)] z-10">
          <Flame className="size-5.5 transition-transform group-hover:rotate-6" />
        </div>
        <div className="flex-1 z-10">
          <h4 className="font-extrabold text-white transition-colors duration-200 group-hover:text-orange-300">
            Gerar conteúdo a partir de um modelo viral
          </h4>
          <p className="mt-0.5 text-xs text-zinc-400 font-medium leading-relaxed group-hover:text-zinc-300 transition-colors">
            Use um template testado e adapte ao seu produto.
          </p>
        </div>
        <div className="grid size-9 place-items-center rounded-full bg-white/5 border border-white/10 group-hover:bg-orange-500/20 group-hover:border-orange-500/40 transition-all duration-200 z-10 shrink-0 shadow-xs">
          <ArrowRight className="size-4.5 text-zinc-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-orange-300" />
        </div>
      </button>

      {/* Option 2: Criação do zero -> Ultra-transparent glassmorphism */}
      <button
        className="group relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-left transition-all duration-200 backdrop-blur-sm hover:border-brand-500/50 hover:bg-white/[0.06] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(139,92,246,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 overflow-hidden cursor-pointer w-full"
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
        <div className="absolute top-0 right-0 w-48 h-full bg-linear-to-l from-brand-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500/25 group-hover:shadow-[0_0_16px_rgba(139,92,246,0.5)] z-10">
          <WandSparkles className="size-5.5 transition-transform group-hover:-rotate-12" />
        </div>
        <div className="flex-1 z-10">
          <h4 className="font-extrabold text-white transition-colors duration-200 group-hover:text-brand-300">
            Gerar conteúdo com criação do zero
          </h4>
          <p className="mt-0.5 text-xs text-zinc-400 font-medium leading-relaxed group-hover:text-zinc-300 transition-colors">
            Monte cada conteúdo manualmente para máximo controle.
          </p>
        </div>
        <div className="grid size-9 place-items-center rounded-full bg-white/5 border border-white/10 group-hover:bg-brand-500/20 group-hover:border-brand-500/40 transition-all duration-200 z-10 shrink-0 shadow-xs">
          <ArrowRight className="size-4.5 text-zinc-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand-300" />
        </div>
      </button>
    </div>
  );
}


