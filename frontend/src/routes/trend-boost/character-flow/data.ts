import { Smile, Meh, Shuffle, Heart, Film, Sparkles, type LucideIcon } from "lucide-react";

// Label e descrição dos tons vêm da API (GET /templates/{slug} → tones).
// O ícone é puramente visual e não é modelado no backend, então é resolvido
// aqui por slug. `fallback` cobre tons novos cadastrados via admin.
export const TONE_ICONS: Record<string, LucideIcon> = {
  funny: Smile,
  sarcastic: Meh,
  absurd: Shuffle,
  cute: Heart,
  nostalgic: Film,
};

export const TONE_ICON_FALLBACK: LucideIcon = Sparkles;

export const toneIcon = (slug: string): LucideIcon => TONE_ICONS[slug] ?? TONE_ICON_FALLBACK;
