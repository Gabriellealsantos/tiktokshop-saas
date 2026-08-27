import { requestBackend } from "@/utils/requests";
import type { UserProductInput } from "@/models/user-product";

// ── Produto próprio do usuário — chamadas HTTP ───────────────────────────────

export const listUserProducts = () =>
  requestBackend({ method: "GET", url: "/api/user-products", withCredentials: true });

/** GET /api/user-products/{id} — produto próprio por id (self-scoped no backend). */
export const getUserProductById = (id: number) =>
  requestBackend({ method: "GET", url: `/api/user-products/${id}`, withCredentials: true });

export const createUserProduct = (dto: UserProductInput) =>
  requestBackend({ method: "POST", url: "/api/user-products", data: dto, withCredentials: true });

export const updateUserProduct = (id: number, dto: UserProductInput) =>
  requestBackend({ method: "PUT", url: `/api/user-products/${id}`, data: dto, withCredentials: true });

export const deleteUserProduct = (id: number) =>
  requestBackend({ method: "DELETE", url: `/api/user-products/${id}`, withCredentials: true });
