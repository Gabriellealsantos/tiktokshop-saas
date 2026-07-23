import { requestBackend } from "@/utils/requests";
import type { MiningWindowEnum, toProductDTO } from "@/models/product-mappers";

// ─────────────────────────────────────────────────────────────────────────────
// Catálogo de produtos minerados (Product) — chamadas HTTP.
// ─────────────────────────────────────────────────────────────────────────────

type ProductSearchParams = {
  search?: string;
  /** Slug da categoria (ex.: "pets"). O backend resolve por slug. */
  category?: string | null;
  window?: MiningWindowEnum | null;
  sort?: string;
  page?: number;
  size?: number;
};

export const searchProducts = (params: ProductSearchParams = {}) =>
  requestBackend({
    method: "GET",
    url: "/api/products",
    withCredentials: true,
    params: {
      search: params.search || undefined,
      category: params.category || undefined,
      window: params.window || undefined,
      sort: params.sort || undefined,
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  });

/** GET /api/products/{id} — produto por id (usado na tela de montagem /templates/use). */
export const getProductById = (id: number) =>
  requestBackend({ method: "GET", url: `/api/products/${id}`, withCredentials: true });

export const getFavorites = () =>
  requestBackend({ method: "GET", url: "/api/products/me/favorites", withCredentials: true });

export const favoriteProduct = (id: number) =>
  requestBackend({ method: "POST", url: `/api/products/${id}/favorite`, withCredentials: true });

export const unfavoriteProduct = (id: number) =>
  requestBackend({ method: "DELETE", url: `/api/products/${id}/favorite`, withCredentials: true });

/** Upload real da imagem do produto -> devolve a URL pública no storage. */
export const uploadProductImage = (file: File) => {
  const data = new FormData();
  data.append("file", file);
  return requestBackend({
    method: "POST",
    url: "/api/products/custom/image",
    data,
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Admin CRUD do catálogo
export const createAdminProduct = (dto: ReturnType<typeof toProductDTO>) =>
  requestBackend({ method: "POST", url: "/api/admin/products", data: dto, withCredentials: true });

export const updateAdminProduct = (id: number, dto: ReturnType<typeof toProductDTO>) =>
  requestBackend({ method: "PUT", url: `/api/admin/products/${id}`, data: dto, withCredentials: true });

export const deleteAdminProduct = (id: number) =>
  requestBackend({ method: "DELETE", url: `/api/admin/products/${id}`, withCredentials: true });
