import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShoppingBag, Eye, TrendingUp, Target, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import type { Product } from "@/models/product";
import { formatPtBr, type deriveProductMetrics } from "@/utils/utils";
import { ContentGenerationOptions } from "../../../content-generation-options";

interface ProductInfoProps {
  product: Product;
  metrics: ReturnType<typeof deriveProductMetrics>;
  onNavigateToContent: () => void;
}

export function ProductInfo({ product, metrics, onNavigateToContent }: ProductInfoProps) {
  return (
    <div className="w-full p-5 md:px-7 md:py-5 flex flex-col justify-between gap-4 overflow-x-hidden">
      <div className="shrink-0">
        {/* Header Badges -> Illuminated Jewel Capsule Chips */}
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.07] border border-white/15 text-xs font-extrabold tracking-wide uppercase text-zinc-300 shadow-xs backdrop-blur-sm">
            {product.category}
          </span>
          {(product.viral || metrics.trendLabel) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-linear-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-xs font-black text-orange-400 shadow-[0_0_16px_-3px_rgba(249,115,22,0.4)] tracking-wide uppercase animate-pulse backdrop-blur-sm">
              🔥 {metrics.trendLabel}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-[26px] font-extrabold text-white tracking-tight leading-tight drop-shadow-xs line-clamp-3">
          {product.name}
        </h2>

        {/* Metadata with Real-Time Indicator Dot */}
        <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-zinc-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>
              Atualizado{" "}
              {formatDistanceToNow(new Date(metrics.lastUpdatedAt), {
                locale: ptBR,
                addSuffix: true,
              })}
            </span>
          </div>
          <span className="text-zinc-600 font-bold">·</span>
          <span>Minerado na janela {metrics.miningWindow}</span>
        </div>
      </div>

      {/* Price & Commission -> Ultra-transparent crystalline glass banner with overflow-hidden to prevent horizontal scrollbar */}
      <div className="shrink-0 p-4 md:px-5 rounded-[20px] bg-white/[0.03] border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col gap-1 backdrop-blur-md relative group transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 overflow-hidden">
        <div className="absolute -right-10 -bottom-10 size-36 rounded-full bg-brand-500/10 blur-2xl pointer-events-none group-hover:bg-brand-500/20 transition-colors duration-500" />
        <div className="flex items-baseline gap-2 z-10">
          <strong className="text-3xl md:text-[34px] font-black tabular-nums text-white tracking-tight drop-shadow-md">
            {product.price}
          </strong>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 z-10 flex-wrap">
          <span>Comissão {metrics.commissionRate}%</span>
          <span className="text-zinc-500 font-bold">·</span>
          <span>
            ganhe{" "}
            <span className="font-extrabold text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]">
              ~{formatPtBr(metrics.earningPerSale, true)}/venda
            </span>
          </span>
        </div>
      </div>

      {/* KPI Stat Grid -> Ultra-transparent telemetry cards */}
      <div className="shrink-0 grid grid-cols-2 gap-2.5">
        {/* Vendas */}
        <div className="group relative flex flex-col gap-1.5 p-3.5 rounded-[16px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-brand-500/40 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute top-0 right-0 size-20 bg-brand-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center gap-2 text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider z-10">
            <div className="grid size-5 place-items-center rounded-md bg-brand-500/20 text-brand-400 border border-brand-500/30 group-hover:scale-110 transition-transform shadow-xs shrink-0">
              <ShoppingBag className="size-3" />
            </div>
            <span>Vendas</span>
          </div>
          <div className="flex items-baseline justify-between z-10">
            <span className="text-xl font-extrabold text-white tracking-tight tabular-nums drop-shadow-xs">
              {formatPtBr(metrics.rawSales)}
            </span>
            {metrics.salesDelta7d > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                +{metrics.salesDelta7d}%
              </span>
            )}
          </div>
        </div>

        {/* Receita */}
        <div className="group relative flex flex-col gap-1.5 p-3.5 rounded-[16px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-emerald-500/40 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute top-0 right-0 size-20 bg-emerald-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center gap-2 text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider z-10">
            <div className="grid size-5 place-items-center rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform shadow-xs shrink-0">
              <TrendingUp className="size-3" />
            </div>
            <span>
              Receita <span className="text-zinc-500 lowercase normal-case font-semibold">(est.)</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between z-10">
            <span className="text-xl font-extrabold text-emerald-400 tracking-tight tabular-nums drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
              {formatPtBr(metrics.revenueEstimate, true)}
            </span>
          </div>
        </div>

        {/* Views */}
        <div className="group relative flex flex-col gap-1.5 p-3.5 rounded-[16px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-blue-500/40 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute top-0 right-0 size-20 bg-blue-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center gap-2 text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider z-10">
            <div className="grid size-5 place-items-center rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform shadow-xs shrink-0">
              <Eye className="size-3" />
            </div>
            <span>Views</span>
          </div>
          <div className="flex items-baseline justify-between z-10">
            <span className="text-xl font-extrabold text-white tracking-tight tabular-nums drop-shadow-xs">
              {formatPtBr(metrics.views)}
            </span>
          </div>
        </div>

        {/* Conversão */}
        <div className="group relative flex flex-col gap-1.5 p-3.5 rounded-[16px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-purple-500/40 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute top-0 right-0 size-20 bg-purple-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center gap-2 text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider z-10">
            <div className="grid size-5 place-items-center rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 group-hover:scale-110 transition-transform shadow-xs shrink-0">
              <Target className="size-3" />
            </div>
            <span>Conversão</span>
          </div>
          <div className="flex items-baseline justify-between z-10">
            <span className="text-xl font-extrabold text-white tracking-tight tabular-nums drop-shadow-xs">
              {metrics.conversionRate.toFixed(2).replace(".", ",")}%
            </span>
          </div>
        </div>
      </div>

      {/* Botões ocultos no desktop (movidos do MediaComponent para o mobile) */}
      <div className="flex md:hidden flex-col gap-4 shrink-0 mt-2">
        {/* Recommended Flow Stepper */}
        <div className="w-full p-4 rounded-[20px] bg-white/[0.03] border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col items-center gap-3 backdrop-blur-md shrink-0">
          <span className="text-[11px] font-black text-brand-400/90 uppercase tracking-[0.2em] drop-shadow-xs">
            FLUXO RECOMENDADO
          </span>
          <div className="flex items-center justify-center gap-2 w-full">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-[linear-gradient(135deg,rgba(75,68,232,0.25)_0%,rgba(75,68,232,0.10)_100%)] border border-brand-500 text-brand-300 shadow-[0_0_20px_-4px_rgba(75,68,232,0.45)] backdrop-blur-md">
              DESCOBRIR
            </span>
            <ChevronRight className="size-4 text-brand-400/70 shrink-0" />
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-medium bg-white/5 text-zinc-300 border border-white/10 hover:border-white/20 hover:text-white transition-colors">
              AFILIAR
            </span>
            <ChevronRight className="size-4 text-zinc-600 shrink-0" />
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-medium bg-white/5 text-zinc-300 border border-white/10 hover:border-white/20 hover:text-white transition-colors">
              CRIAR
            </span>
          </div>
        </div>

        {/* Primary Action */}
        <button
          type="button"
          onClick={() => {
            if (product.affiliateUrl) {
              window.open(product.affiliateUrl, "_blank");
            } else {
              toast.success("Link de afiliado será gerado em breve!");
            }
          }}
          className="group btn-brand gradient-brand luminous-glow relative w-full h-13 overflow-hidden rounded-full font-bold text-white/90 drop-shadow-sm transition-all duration-200 hover:luminous-glow-hover hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] cursor-pointer outline-none shrink-0"
        >
          <div className="relative flex h-full w-full items-center justify-center gap-3 px-6">
            <ShoppingBag className="size-5 text-white drop-shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110 shrink-0" />
            <span className="text-[15px] tracking-wide drop-shadow-xs font-extrabold">Afiliar no TikTok Shop</span>
          </div>
        </button>
      </div>

      {/* Content Generation Actions */}
      <div className="shrink-0 mt-2">
        <ContentGenerationOptions product={product} onNavigate={onNavigateToContent} />
      </div>
    </div>
  );
}



