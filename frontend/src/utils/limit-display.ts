/** Verifica se o limite é ilimitado (sentinela -1 do backend). */
export function isUnlimited(max: number): boolean {
  return max === -1;
}

/**
 * Formata o texto de cota restante.
 * - Ilimitado → "Ilimitado"
 * - Com limite → "X/Y"
 */
export function formatRemaining(max: number, remaining: number): string {
  if (max === -1) return "Ilimitado";
  return `${Math.max(0, remaining)}/${max}`;
}

/**
 * Retorna `true` se o usuário ainda pode gerar.
 * Ilimitado → sempre true; com limite → remaining > 0.
 */
export function hasQuota(max: number, remaining: number): boolean {
  if (max === -1) return true;
  return remaining > 0;
}
