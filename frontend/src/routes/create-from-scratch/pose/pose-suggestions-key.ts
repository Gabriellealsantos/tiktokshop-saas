/**
 * Chave de cache das sugestões de pose. Vitrine e produto próprio têm ids independentes,
 * então o id sozinho colidiria — o prefixo distingue a origem. Compartilhada entre o
 * prefetch (etapa Cenário) e a query real (etapa Pose).
 */
export function poseSuggestionsKey(
  productId?: string | null,
  userProductId?: string | null,
  customProductName?: string | null,
): string {
  if (userProductId) return `user-${userProductId}`;
  if (productId) return productId;
  return customProductName ?? "none";
}
