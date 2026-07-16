// ─────────────────────────────────────────────────────────────────────────────
// Produto próprio do usuário (UserProduct) — CRUD self-scoped no backend.
// Minimal: nome, descrição e imagem (obrigatória). Sem métricas/categoria.
// ─────────────────────────────────────────────────────────────────────────────

export type UserProduct = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string | null;
};

export type UserProductInput = {
  name: string;
  description?: string | null;
  imageUrl: string;
};
