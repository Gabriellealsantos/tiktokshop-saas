export type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  sales: string;
  image: string;
  favorite?: boolean;
  // KPI / Stats Extension
  views?: number;
  revenueEstimate?: number;
  conversionRate?: number;
  commissionRate?: number;
  salesPerDay?: number;
  salesDelta7d?: number;
  trendLabel?: string;
  rankInCategory?: number;
  salesHistory7d?: number[];
  lastUpdatedAt?: string;
  miningWindow?: string;
  description?: string;
  viral?: boolean;
  affiliateUrl?: string;
};

const productNames = [
  "Sérum Vitamina C Glow",
  "Mini Aspirador Portátil",
  "Legging Sculpt Pro",
  "Fone AirBeat",
  "Organizador Modular",
  "Escova Alisadora",
  "Luminária Sunset",
  "Garrafa Térmica 1L",
  "Massageador Cervical",
  "Bolsa Urban Mini",
  "Kit Skin Glass",
  "Câmera Wi-Fi 360",
  "Tênis Cloud Walk",
];
const categories = [
  "Beleza & Cuidados",
  "Casa & Decoração",
  "Saúde & Fitness",
  "Tecnologia",
  "Moda & Estilo",
  "Acessórios",
];

export const products: Product[] = Array.from({ length: 91 }, (_, index) => ({
  id: index + 1,
  name: `${productNames[index % productNames.length]}${index > 12 ? ` · ${index + 1}` : ""}`,
  category: categories[index % categories.length],
  price: `R$ ${(39 + ((index * 17) % 260)).toFixed(2).replace(".", ",")}`,
  sales: `${(1.2 + (index % 18) * 0.7).toFixed(1)} mil vendas`,
  image: `https://images.unsplash.com/photo-${["1523275335684-37898b6baf30", "1596462502278-27bfdc403348", "1542291026-7eec264c27ff", "1503602642458-232111445657", "1600185365483-26d7a4cc7519", "1560343090-f0409e92791a"][index % 6]}?auto=format&fit=crop&w=700&q=75`,
  favorite: index % 11 === 0,
}));

export const avatars = [
  {
    id: 1,
    name: "Camila Rocha",
    gender: "Feminino",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 2,
    name: "Rafael Lima",
    gender: "Masculino",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 3,
    name: "Marina Alves",
    gender: "Feminino",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 4,
    name: "Lucas Nogueira",
    gender: "Masculino",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 5,
    name: "Bianca Melo",
    gender: "Modelo IA",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 6,
    name: "Diego Martins",
    gender: "Modelo IA",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80",
  },
];

export const dashboardSeries = [
  { day: "Seg", vendas: 18200, pedidos: 124 },
  { day: "Ter", vendas: 24800, pedidos: 168 },
  { day: "Qua", vendas: 21600, pedidos: 147 },
  { day: "Qui", vendas: 31400, pedidos: 211 },
  { day: "Sex", vendas: 38900, pedidos: 262 },
  { day: "Sáb", vendas: 44600, pedidos: 301 },
  { day: "Dom", vendas: 41200, pedidos: 278 },
];

export const users = Array.from({ length: 28 }, (_, index) => ({
  id: index + 1,
  name:
    ["Ana Souza", "Bruno Costa", "Carla Mendes", "Daniel Reis", "Elisa Prado", "Felipe Moura"][
      index % 6
    ] + (index > 5 ? ` ${index + 1}` : ""),
  email: `criador${index + 1}@exemplo.com`,
  status: index < 16 ? "Pendente" : index % 7 === 0 ? "Bloqueado" : "Ativo",
  plan: ["Mensal", "Trimestral", "Vitalício"][index % 3],
}));

export const prompts = [
  [
    "Mexendo no Cabelo",
    "Vídeos",
    "Movimento natural de mão ajustando o cabelo, câmera frontal, luz suave e expressão confiante.",
  ],
  [
    "Selfie Sorriso",
    "Imagens",
    "Selfie espontânea, sorriso natural, enquadramento próximo e iluminação de janela.",
  ],
  [
    "Review de Produto",
    "Vídeos",
    "Creator apresenta o produto em três ângulos, destaca textura e finaliza com CTA sutil.",
  ],
  [
    "Cozinha Premium",
    "Cenários",
    "Cozinha contemporânea, bancada de mármore, luz matinal difusa e profundidade cinematográfica.",
  ],
  [
    "Unboxing Natural",
    "Vídeos",
    "Mãos abrindo embalagem, foco alternado no detalhe, movimentos reais e áudio ambiente.",
  ],
  [
    "Estúdio Editorial",
    "Cenários",
    "Fundo cinza carvão, recorte de luz lateral e atmosfera editorial sofisticada.",
  ],
];

export const academyModules = [
  {
    title: "Fundamentos que vendem",
    lessons: ["Boas-vindas e método", "Anatomia de um viral", "Oferta irresistível"],
  },
  {
    title: "Mineração estratégica",
    lessons: ["Leitura de tendências", "Validação de produto", "Janela de oportunidade"],
  },
  {
    title: "Roteiro e retenção",
    lessons: ["Hooks de três segundos", "Tensão e prova", "CTA sem fricção"],
  },
  {
    title: "Produção com IA",
    lessons: ["Avatares consistentes", "Prompts cinematográficos", "Fluxo no VEO"],
  },
  {
    title: "Escala e análise",
    lessons: ["Métricas essenciais", "Testes em volume", "Duplicando vencedores"],
  },
  {
    title: "Operação avançada",
    lessons: ["Rotina de creator", "Biblioteca de ativos", "Plano de 30 dias"],
  },
];
