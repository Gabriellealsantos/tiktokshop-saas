import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShoppingBag, Eye, TrendingUp, Target } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import type { Product } from "@/models/product";
import { Pill } from "@/components";
import { formatPtBr } from "@/utils/utils";
import { ContentGenerationOptions } from "../../../content-generation-options";

interface ProductInfoProps {
  product: Product;
  metrics: any;
  onNavigateToContent: () => void;
}

export function ProductInfo({ product, metrics, onNavigateToContent }: ProductInfoProps) {
  return (
    <div className="flex flex-col w-full p-6 md:p-8 overflow-y-auto bg-surface-1">
      {/* Header & Badges */}
      <div className="flex items-center gap-2 mb-3">
        <Pill className="border-white/10 bg-surface-2 text-text-2 text-xs">
          {product.category}
        </Pill>
        {(product.viral || metrics.trendLabel) && (
          <Pill className="border-orange-500/20 bg-orange-500/10 text-orange-500 text-xs">
            🔥 {metrics.trendLabel}
          </Pill>
        )}
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-text-1 leading-tight">
        {product.name}
      </h2>

      <div className="mt-2 text-xs text-text-3 font-medium flex items-center gap-1.5 flex-wrap">
        <span>
          Atualizado{" "}
          {formatDistanceToNow(new Date(metrics.lastUpdatedAt), {
            locale: ptBR,
            addSuffix: true,
          })}
        </span>
        <span>·</span>
        <span>Minerado na janela {metrics.miningWindow}</span>
      </div>

      {/* Price & Earning */}
      <div className="mt-6 flex flex-col gap-1">
        <div className="flex items-end gap-3">
          <strong className="text-4xl font-bold tabular-nums text-text-1">
            {product.price}
          </strong>
        </div>
        <p className="text-sm text-text-2">
          Comissão {metrics.commissionRate}% · ganhe{" "}
          <span className="text-success font-medium">
            ~{formatPtBr(metrics.earningPerSale, true)}/venda
          </span>
        </p>
      </div>

      {/* KPI Grid */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {/* Vendas */}
        <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-white/5 bg-surface-2/30">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-text-3 uppercase tracking-wider">
            <ShoppingBag className="size-3.5" />
            <span>Vendas</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-text-1">
              {formatPtBr(metrics.rawSales)}
            </span>
            {metrics.salesDelta7d > 0 && (
              <span className="text-[10px] font-medium text-success">
                +{metrics.salesDelta7d}%
              </span>
            )}
          </div>
        </div>

        {/* Receita */}
        <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-white/5 bg-surface-2/30">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-text-3 uppercase tracking-wider">
            <TrendingUp className="size-3.5" />
            <span>
              Receita <span className="text-white/30 lowercase normal-case">(est.)</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-success">
              {formatPtBr(metrics.revenueEstimate, true)}
            </span>
          </div>
        </div>

        {/* Views */}
        <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-white/5 bg-surface-2/30">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-text-3 uppercase tracking-wider">
            <Eye className="size-3.5" />
            <span>Views</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-text-1">{formatPtBr(metrics.views)}</span>
          </div>
        </div>

        {/* Conversão */}
        <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-white/5 bg-surface-2/30">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-text-3 uppercase tracking-wider">
            <Target className="size-3.5" />
            <span>Conversão</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-text-1">
              {metrics.conversionRate.toFixed(2).replace(".", ",")}%
            </span>
          </div>
        </div>
      </div>

      {/* Sales Pace + Trend Chart */}
      <div className="mt-4 p-4 rounded-xl border border-white/5 bg-surface-2/30 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-text-1">Ritmo de vendas</div>
          <div className="text-xs text-text-3 text-right">
            ≈ {formatPtBr(metrics.salesPerDay)} vendas/dia
            <br />
            <span className="text-[10px]">
              1 a cada ~{Math.round(metrics.intervalMinutes)} min
            </span>
          </div>
        </div>
        <div className="h-14 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.salesHistory7d}>
              <defs>
                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="vendas"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVendas)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="text-[10px] text-center text-text-3 uppercase tracking-wider font-semibold">
          Vendas · Últimos 7 dias
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <p className="mt-6 text-sm text-text-2 leading-relaxed">{product.description}</p>
      )}

      {/* NEW Content Generation Actions */}
      <ContentGenerationOptions product={product} onNavigate={onNavigateToContent} />
    </div>
  );
}
