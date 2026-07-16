import type { Product } from "./product";

// ─────────────────────────────────────────────────────────────────────────────
// Types / Enums do catálogo de produtos minerados.
// Mapeia o ProductDTO do backend <-> o modelo Product do front, incluindo a
// tradução dos enums de categoria e janela de mineração.
// ─────────────────────────────────────────────────────────────────────────────

export type ProductCategoryEnum =
  | "FAVORITOS" | "TOP_PRODUTOS" | "BELEZA_CUIDADOS" | "CASA_MAIS"
  | "SAUDE_FITNESS" | "MODA" | "TECNOLOGIA" | "ACESSORIOS";

export type MiningWindowEnum = "W_00_06" | "W_06_12" | "W_12_18" | "W_18_24";

/** ProductDTO do backend. */
export type BackendProduct = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: ProductCategoryEnum | null;
  sales: number | null;
  views: number | null;
  affiliateLink: string | null;
  price: number | null;
  commissionPct: number | null;
  estimatedRevenue: number | null;
  conversionRate: number | null;
  salesPerDay: number | null;
  delta7d: number | null;
  history7d: number[] | null;
  miningWindow: MiningWindowEnum | null;
  trendLabel: string | null;
  rankPosition: number | null;
  images: string[] | null;
  createdByAdmin: boolean;
  createdAt: string | null;
};

// Rótulo (UI) <-> enum (backend). Fonte única para os dois sentidos.
const CATEGORY_LABEL_TO_ENUM: Record<string, ProductCategoryEnum> = {
  "Beleza & Cuidados": "BELEZA_CUIDADOS",
  "Casa & Decoração": "CASA_MAIS",
  "Saúde & Fitness": "SAUDE_FITNESS",
  "Tecnologia": "TECNOLOGIA",
  "Moda & Estilo": "MODA",
  "Acessórios": "ACESSORIOS",
};

const CATEGORY_ENUM_TO_LABEL: Record<ProductCategoryEnum, string> = {
  FAVORITOS: "Favoritos",
  TOP_PRODUTOS: "Top Produtos",
  BELEZA_CUIDADOS: "Beleza & Cuidados",
  CASA_MAIS: "Casa & Decoração",
  SAUDE_FITNESS: "Saúde & Fitness",
  MODA: "Moda & Estilo",
  TECNOLOGIA: "Tecnologia",
  ACESSORIOS: "Acessórios",
};

const WINDOW_LABEL_TO_ENUM: Record<string, MiningWindowEnum> = {
  "00:00–06:00": "W_00_06",
  "06:00–12:00": "W_06_12",
  "12:00–18:00": "W_12_18",
  "18:00–00:00": "W_18_24",
};

const WINDOW_ENUM_TO_LABEL: Record<MiningWindowEnum, string> = {
  W_00_06: "00:00–06:00",
  W_06_12: "06:00–12:00",
  W_12_18: "12:00–18:00",
  W_18_24: "18:00–00:00",
};

/** Rótulo do pill (products screen) -> enum de categoria, ou null p/ "todos". */
export function categoryLabelToEnum(label: string): ProductCategoryEnum | null {
  return CATEGORY_LABEL_TO_ENUM[label] ?? null;
}

function formatBRL(value: number | null | undefined): string {
  const n = typeof value === "number" ? value : 0;
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

/** BackendProduct -> Product (modelo do front). `favorite` vem do chamador (lista de favoritos). */
export function mapBackendToProduct(dto: BackendProduct, favorite = false): Product {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.category ? CATEGORY_ENUM_TO_LABEL[dto.category] : "Top Produtos",
    price: formatBRL(dto.price),
    sales: `${dto.sales ?? 0} vendas`,
    image: dto.imageUrl ?? "",
    favorite,
    views: dto.views ?? undefined,
    revenueEstimate: dto.estimatedRevenue ?? undefined,
    conversionRate: dto.conversionRate ?? undefined,
    commissionRate: dto.commissionPct ?? undefined,
    salesPerDay: dto.salesPerDay ?? undefined,
    salesDelta7d: dto.delta7d ?? undefined,
    trendLabel: dto.trendLabel ?? undefined,
    rankInCategory: dto.rankPosition ?? undefined,
    salesHistory7d: dto.history7d ?? undefined,
    miningWindow: dto.miningWindow ? WINDOW_ENUM_TO_LABEL[dto.miningWindow] : undefined,
    description: dto.description ?? undefined,
    viral: dto.rankPosition != null && dto.rankPosition <= 3,
    affiliateUrl: dto.affiliateLink ?? undefined,
    images: dto.images ?? undefined,
  };
}

/** Valores do formulário do add-product-modal (campos ricos são preenchidos só pelo admin). */
export type ProductFormValues = {
  image: string;
  images?: string;
  name: string;
  category: string;
  price?: number;
  sales?: string;
  views?: number;
  revenueEstimate?: number;
  conversionRate?: number;
  commissionRate?: number;
  salesPerDay?: number;
  trendLabel?: string;
  rankInCategory?: number;
  salesHistory7d?: string;
  miningWindow?: string;
  affiliateUrl?: string;
};

function parseIntList(csv?: string): number[] | null {
  if (!csv) return null;
  const arr = csv.split(",").map((s) => Number(s.trim())).filter((n) => !isNaN(n));
  return arr.length ? arr : null;
}

function parseStringList(csv?: string): string[] | null {
  if (!csv) return null;
  const arr = csv.split(",").map((s) => s.trim()).filter(Boolean);
  return arr.length ? arr : null;
}

/** Valores do formulário -> ProductDTO do backend (create/update admin). */
export function toProductDTO(values: ProductFormValues) {
  const salesInt = values.sales ? parseInt(values.sales.replace(/\D/g, ""), 10) : 0;
  return {
    name: values.name,
    imageUrl: values.image,
    category: categoryLabelToEnum(values.category) ?? "TOP_PRODUTOS",
    sales: isNaN(salesInt) ? 0 : salesInt,
    views: values.views ?? 0,
    affiliateLink: values.affiliateUrl || null,
    price: values.price ?? 0,
    commissionPct: values.commissionRate ?? null,
    estimatedRevenue: values.revenueEstimate ?? null,
    conversionRate: values.conversionRate ?? null,
    salesPerDay: values.salesPerDay ?? null,
    history7d: parseIntList(values.salesHistory7d),
    miningWindow: values.miningWindow ? WINDOW_LABEL_TO_ENUM[values.miningWindow] ?? null : null,
    trendLabel: values.trendLabel || null,
    rankPosition: values.rankInCategory ?? null,
    images: parseStringList(values.images),
    createdByAdmin: true,
  };
}
