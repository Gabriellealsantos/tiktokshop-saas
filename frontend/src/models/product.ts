export type Product = {
  id: number;
  /**
   * De onde o produto veio. "catalog" (padrão) = vitrine minerada (/api/products);
   * "user" = produto próprio cadastrado pelo usuário (/api/user-products). Os dois têm
   * espaços de id independentes, então quem manda o id ao backend PRECISA olhar isto
   * para escolher entre `productId` e `userProductId`.
   */
  source?: "catalog" | "user";
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
