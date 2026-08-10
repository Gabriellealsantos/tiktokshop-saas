import {
  Banknote,
  CircleDollarSign,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
  Wallet,
  Eye,
  MousePointerClick,
} from "lucide-react";

import { MetricCard } from "@/components";
import type { DashboardSummary } from "@/models/dashboard";

const brl = (n: number, digits = 0) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n ?? 0);
const int = (n: number) => new Intl.NumberFormat("pt-BR").format(n ?? 0);
const compact = (n: number) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(n ?? 0);

interface MetricsGridProps {
  summary: DashboardSummary | null;
}

export function MetricsGrid({ summary }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="GMV"
        value={summary ? brl(summary.revenue) : "—"}
        hint="Base + vendas ao vivo"
        tone="neutral"
        icon={Banknote}
        surface="elevated"
        emphasis="primary"
      />
      <MetricCard
        label="Itens Vendidos"
        value={summary ? int(summary.itemsSold) : "—"}
        hint="No período"
        tone="neutral"
        icon={ShoppingCart}
        surface="elevated"
      />
      <MetricCard
        label="Ticket médio"
        value={summary ? brl(summary.avgTicket, 2) : "—"}
        hint="Faturamento / pedidos"
        tone="neutral"
        icon={ReceiptText}
        surface="elevated"
      />
      <MetricCard
        label="Comissão estimada"
        value={summary ? brl(summary.commission) : "—"}
        hint="Sobre as vendas"
        tone="neutral"
        icon={CircleDollarSign}
        surface="elevated"
      />
      <MetricCard
        label="Base de Comissão"
        value={summary ? brl(summary.commissionBase) : "—"}
        hint="Consistente com o volume"
        tone="neutral"
        icon={Wallet}
        surface="elevated"
      />
      <MetricCard
        label="Visualizações do Produto"
        value={summary ? compact(summary.productViews) : "—"}
        hint="Em tempo real"
        tone="neutral"
        icon={Eye}
        surface="elevated"
      />
      <MetricCard
        label="Pedidos confirmados"
        value={summary ? int(summary.orders) : "—"}
        hint="No período"
        tone="neutral"
        icon={PackageCheck}
        surface="elevated"
      />
      <MetricCard
        label="Cliques no Produto"
        value={summary ? compact(summary.productClicks) : "—"}
        hint="Em tempo real"
        tone="neutral"
        icon={MousePointerClick}
        surface="elevated"
      />
    </div>
  );
}
