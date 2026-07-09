import { Heart, ShoppingBag, Eye, TrendingUp, Target, Flame, ArrowRight, WandSparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { Product } from "@/mock/data";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Pill } from "@/components/base/primitives";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatPtBr(num: number, currency = false): string {
  if (num >= 1000000) {
    const val = (num / 1000000).toFixed(1).replace(".", ",");
    return currency ? `R$ ${val} mi` : `${val} mi`;
  }
  if (num >= 1000) {
    const val = (num / 1000).toFixed(1).replace(".", ",");
    return currency ? `R$ ${val} mil` : `${val} mil`;
  }
  const val = num.toLocaleString("pt-BR");
  return currency ? `R$ ${val}` : val;
}

function deriveProductMetrics(product: Product) {
  // Parse original sales string back into a number if it's string.
  // The existing sales string is like "1.2 mil vendas"
  const rawSalesNumberMatch = product.sales.match(/[\d,.]+/);
  const rawSales = rawSalesNumberMatch
    ? parseFloat(rawSalesNumberMatch[0].replace(",", ".")) * 1000
    : 0;

  // Parse price into a number.
  // Existing price string: "R$ 49,90"
  const rawPriceMatch = product.price.match(/[\d,.]+/);
  const priceNumber = rawPriceMatch
    ? parseFloat(rawPriceMatch[0].replace(".", "").replace(",", "."))
    : 0;

  // a. Real field -> b. Derived formula -> c. Typed mock
  const commissionRate = product.commissionRate ?? 15; // TODO: connect admin-defined metric (mock fallback: 15%)

  // Revenue: sales * price
  const revenueEstimate = product.revenueEstimate ?? rawSales * priceNumber;
  // Earnings per sale: price * commissionRate
  const earningPerSale = priceNumber * (commissionRate / 100);

  // Sales Per Day: sales / productAge
  const productAgeInDays = 30; // TODO: connect admin-defined metric
  const salesPerDay = product.salesPerDay ?? Math.round(rawSales / productAgeInDays);

  const intervalMinutes = salesPerDay > 0 ? (24 * 60) / salesPerDay : 0;

  // Trend mini-chart
  // Mock fallback: generated curve around salesPerDay
  const salesHistory7d = product.salesHistory7d ?? Array.from({ length: 7 }, (_, i) => ({
    day: `D-${7 - i}`,
    vendas: Math.max(
      0,
      salesPerDay + Math.floor(Math.random() * salesPerDay * 0.5 - salesPerDay * 0.25)
    ),
  })); // TODO: connect admin-defined metric

  // Views mock fallback (Assuming ~7% conversion rate on average)
  const views = product.views ?? rawSales * 14;

  // Conversion rate
  const conversionRate = product.conversionRate ?? (rawSales / Math.max(1, views)) * 100;

  // Delta 7d
  const salesDelta7d = product.salesDelta7d ?? 18; // TODO: connect admin-defined metric

  const lastUpdatedAt = product.lastUpdatedAt ?? new Date().toISOString(); // TODO: connect admin-defined metric
  const miningWindow = product.miningWindow ?? "12:00–18:00"; // TODO: connect admin-defined metric
  const trendLabel = product.trendLabel ?? "Em alta"; // TODO: connect admin-defined metric

  return {
    rawSales,
    priceNumber,
    commissionRate,
    revenueEstimate,
    earningPerSale,
    salesPerDay,
    intervalMinutes,
    salesHistory7d,
    views,
    conversionRate,
    salesDelta7d,
    lastUpdatedAt,
    miningWindow,
    trendLabel,
  };
}

export function ProductDetailsModal({ product, isOpen, onOpenChange }: ProductDetailsModalProps) {
  const navigate = useNavigate();

  if (!product) return null;

  const metrics = deriveProductMetrics(product);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[1000px] gap-0 p-0 overflow-hidden border-white/10 bg-surface-1 text-text-1 shadow-2xl",
          "max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0 max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:border-b-0",
          "sm:rounded-2xl"
        )}
      >
        <VisuallyHidden.Root>
          <DialogTitle>Detalhes do Produto: {product.name}</DialogTitle>
          <DialogDescription>Dossiê completo com estatísticas para {product.name}</DialogDescription>
        </VisuallyHidden.Root>

        <div className="flex flex-col md:flex-row h-full max-h-[90dvh] md:max-h-[85vh]">
          {/* LEFT: Media & Main Actions */}
          <div className="relative flex flex-col w-full md:w-[44%] bg-surface-3 md:border-r md:border-white/10 shrink-0 overflow-y-auto p-6 md:p-8 gap-6">
            {/* Image Card */}
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 shrink-0">
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/30 pointer-events-none" />

              <span className="absolute left-4 top-4">
                <Pill className="border-white/10 bg-black/40 text-white shadow-sm backdrop-blur-md">
                  {product.category.split(" & ")[0]}
                </Pill>
              </span>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toast.success(
                    product.favorite ? "Removido dos favoritos" : "Adicionado aos favoritos!"
                  );
                }}
                className={cn(
                  "absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-white/10 backdrop-blur-md transition-colors hover:scale-110",
                  product.favorite
                    ? "bg-black/40 text-danger"
                    : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white"
                )}
              >
                <Heart className="size-5" fill={product.favorite ? "currentColor" : "none"} />
              </button>

              {/* Thumbnails ONLY if there are multiple images */}
              {"images" in product &&
                Array.isArray((product as any).images) &&
                (product as any).images.length > 1 && (
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto">
                    {((product as any).images as string[]).map((img, i) => (
                      <div
                        key={i}
                        className="size-16 rounded-md border border-white/20 bg-black/40 overflow-hidden shrink-0"
                      >
                        <img src={img} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Actions Moved to Left */}
            <div className="flex flex-col gap-3 mt-auto">
              <div className="mb-1 text-center text-[11px] text-text-3 uppercase tracking-wider font-semibold">
                Fluxo Recomendado: Descobrir &rarr; Afiliar &rarr; Criar
              </div>

              <button
                onClick={() => {
                  if (product.affiliateUrl) {
                    window.open(product.affiliateUrl, "_blank");
                  } else {
                    toast.success("Link de afiliado será gerado em breve!"); // TODO
                  }
                }}
                className="gradient-brand flex h-12 w-full items-center justify-center rounded-[14px] text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Afiliar no TikTok Shop
              </button>

              <button
                onClick={() => {
                  toast.success("Redirecionando para o estúdio com este produto...");
                  onOpenChange(false);
                  navigate({ to: "/estudio" });
                }}
                className="flex h-12 w-full items-center justify-center rounded-[14px] border border-border bg-surface-2 text-base font-semibold text-text-1 transition-colors hover:bg-surface-3 active:scale-[0.98]"
              >
                Criar conteúdo
              </button>
            </div>
          </div>

          {/* RIGHT: Info + New Actions */}
          <div className="flex flex-col w-full md:w-[56%] p-6 md:p-8 overflow-y-auto bg-surface-1">
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
            <div className="mt-8 flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold text-text-1">Gere conteúdo com este produto de duas formas</h3>
                <p className="text-sm text-text-3 mt-0.5">Escolha o caminho ideal para criar seu vídeo</p>
              </div>

              <button 
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-surface-2 p-4 text-left transition-all hover:border-white/10 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-12px_rgba(139,92,246,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                onClick={() => {
                  onOpenChange(false);
                  navigate({ 
                    to: "/gerar/modelo-viral", 
                    search: { productId: product.id } 
                  });
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
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-surface-2 p-4 text-left transition-all hover:border-white/10 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-12px_rgba(139,92,246,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                onClick={() => {
                  onOpenChange(false);
                  navigate({ 
                    to: "/criar-do-zero", 
                    search: { productId: product.id } 
                  });
                }}
              >
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-400 transition-colors group-hover:bg-violet-500/20">
                  <WandSparkles className="size-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-text-1 transition-colors group-hover:text-white">Gerar conteúdo com criação do zero</h4>
                  <p className="mt-1 text-xs text-text-3 leading-relaxed">Monte cada conteúdo manualmente para máximo controle.</p>
                </div>
                <ArrowRight className="size-5 text-text-3 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
