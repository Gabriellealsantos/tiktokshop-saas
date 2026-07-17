import { requestBackend } from "../utils/requests";
import type { Category } from "@/models/category";

// Categorias de produtos minerados — leitura aberta; escrita restrita a ADMIN.

export const getCategories = () =>
  requestBackend({ method: "GET", url: "/api/categories", withCredentials: true });

export const createCategory = (category: Category) =>
  requestBackend({ method: "POST", url: "/api/admin/categories", data: category, withCredentials: true });

export const updateCategory = (id: number, category: Category) =>
  requestBackend({ method: "PUT", url: `/api/admin/categories/${id}`, data: category, withCredentials: true });

export const deleteCategory = (id: number) =>
  requestBackend({ method: "DELETE", url: `/api/admin/categories/${id}`, withCredentials: true });
