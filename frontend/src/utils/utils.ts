import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Product } from "@/models/product";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPtBr(num: number, currency = false): string {
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

export function deriveProductMetrics(product: Product) {
  // Parse original sales string back into a number if it's string.
  // The existing sales string is like "1.2 mil vendas"
  const salesStr = product.sales ? product.sales.toLowerCase().replace(/\s/g, "") : "";
  const rawSalesNumberMatch = salesStr.match(/[\d,.]+/);
  let rawSales = 0;

  if (rawSalesNumberMatch) {
    const val = parseFloat(rawSalesNumberMatch[0].replace(",", "."));
    if (salesStr.includes("mi") || salesStr.includes("m")) {
      rawSales = val >= 1000000 ? val : val * 1000000;
    } else if (salesStr.includes("k") || salesStr.includes("mil")) {
      rawSales = val >= 1000 ? val : val * 1000;
    } else {
      rawSales = val;
    }
  }

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
