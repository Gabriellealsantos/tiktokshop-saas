export type Product = {
  id: number;
  name: string;
  category: string;
  categoryId?: number;
  categorySlug?: string;
  price: string;
  sales: string;
  image: string;
  favorite: boolean;
  // KPI / Stats Extension
  rating?: number;
  reviewsCount?: number;
  views?: number;
  revenueEstimate?: number;
  conversionRate?: number;
  commissionRate?: number;
  salesPerDay?: number;
  salesDelta7d?: number;
  trendLabel?: string;
  rankInCategory?: number;
  salesHistory7d?: number[];
  lastUpdatedAt?: string;
  miningWindow?: string;
  description?: string;
  viral: boolean;
  affiliateUrl?: string;
  images?: string[];
};
