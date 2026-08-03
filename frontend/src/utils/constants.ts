export const APP_NAME = "Ennvo";

export const appRoutes = [
  { to: "/", label: "Início" },
  { to: "/dashboard", label: "Painel" },
  { to: "/products", label: "Produtos" },
  { to: "/trend-boost", label: "Trend AI" },
  { to: "/avatars", label: "Avatares" },
] as const;

export const scenarios = [
  "Quarto",
  "Estúdio",
  "Ao ar livre",
  "Academia",
  "Cozinha",
  "Escritório",
  "Banheiro",
  "Loja",
  "Natureza",
  "Personalizado",
];
export const voiceTones = [
  "Natural",
  "Confiante",
  "Energético",
  "Misterioso",
  "Sarcástico",
  "Professoral",
];
export const takeOptions = [
  { takes: 1, seconds: 8 },
  { takes: 2, seconds: 16 },
  { takes: 3, seconds: 24 },
  { takes: 4, seconds: 32 },
  { takes: 5, seconds: 40 },
];

export const finalPrompt = `Crie uma sequência vertical 9:16, com realismo publicitário e continuidade visual. O creator apresenta o produto com movimentos naturais, contato visual e ritmo de TikTok. Preserve textura, proporções e identidade em todos os takes. Use iluminação suave, profundidade realista e finalize com um CTA orgânico, sem textos artificiais na imagem.`;
