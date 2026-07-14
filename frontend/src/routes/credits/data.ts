export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  bonusPercent?: number;
  badge?: string;
  highlighted?: boolean;
};

export const packages: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: 29.9,
    description: "Use em imagens, vídeos e avatares",
  },
  {
    id: "essencial",
    name: "Essencial",
    credits: 300,
    price: 79.9,
    bonusPercent: 10,
    description: "Use em imagens, vídeos e avatares",
  },
  {
    id: "pro",
    name: "Pro",
    credits: 600,
    price: 149.9,
    badge: "Mais popular",
    highlighted: true,
    description: "Use em imagens, vídeos e avatares",
  },
  {
    id: "premium",
    name: "Premium",
    credits: 1200,
    price: 279.9,
    bonusPercent: 20,
    description: "Use em imagens, vídeos e avatares",
  },
  {
    id: "business",
    name: "Business",
    credits: 3000,
    price: 649.9,
    bonusPercent: 25,
    description: "Use em imagens, vídeos e avatares",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 6000,
    price: 1199.9,
    badge: "Melhor custo-benefício",
    description: "Use em imagens, vídeos e avatares",
  },
];
