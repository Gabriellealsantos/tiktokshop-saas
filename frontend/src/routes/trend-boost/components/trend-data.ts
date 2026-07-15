export interface TrendCharacter {
  id: string;
  name: string;
  image: string;
}

export interface TrendTemplate {
  id: string;
  title: string;
  subtitle: string;
  characters: TrendCharacter[];
}

export const trendTemplates: Record<string, TrendTemplate> = {
  novelinha: {
    id: "novelinha",
    title: "Vovôs e Vovós",
    subtitle: "Escolha o personagem que vai protagonizar sua história.",
    characters: Array.from({ length: 10 }).map((_, i) => ({
      id: `novelinha-char-${i + 1}`,
      name: `Personagem ${i + 1}`,
      image: `/characters/novelinha/char-${i + 1}.png`,
    })),
  },
  objetos: {
    id: "objetos",
    title: "Objetos Falantes",
    subtitle: "Escolha o objeto que vai narrar sua dica.",
    characters: Array.from({ length: 10 }).map((_, i) => ({
      id: `objetos-char-${i + 1}`,
      name: `Personagem ${i + 1}`,
      image: `/characters/objetos/char-${i + 1}.png`,
    })),
  },
};
