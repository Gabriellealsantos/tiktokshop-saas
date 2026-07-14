import { Sun, Sunset, Moon, Sparkles, Lightbulb, Clapperboard, Circle, Flame, Activity, Zap, Gem } from "lucide-react";

// TODO: confirmar o rótulo do 9º item ("Estúdio neutro" ou "Estúdio"), e os slugs de imagem de cada local.
export const LOCAIS = [
  { id: "quarto", label: "Quarto", image: "/placeholder-cenario-quarto.jpg" },
  { id: "sala-loft", label: "Sala/Loft", image: "/placeholder-cenario-sala.jpg" },
  { id: "cozinha", label: "Cozinha", image: "/placeholder-cenario-cozinha.jpg" },
  { id: "closet", label: "Closet", image: "/placeholder-cenario-closet.jpg" },
  { id: "home-office", label: "Home office", image: "/placeholder-cenario-office.jpg" },
  { id: "rua-urbana", label: "Rua urbana", image: "/placeholder-cenario-rua.jpg" },
  { id: "cafe", label: "Café", image: "/placeholder-cenario-cafe.jpg" },
  { id: "restaurante", label: "Restaurante", image: "/placeholder-cenario-restaurante.jpg" },
  { id: "estudio", label: "Estúdio neutro", image: "/placeholder-cenario-estudio.jpg" },
  { id: "praia", label: "Praia", image: "/placeholder-cenario-praia.jpg" },
  { id: "parque", label: "Parque", image: "/placeholder-cenario-parque.jpg" },
  { id: "academia", label: "Academia", image: "/placeholder-cenario-academia.jpg" },
];

export const HORARIOS = [
  {
    id: "manha",
    label: "Manhã",
    icon: Sun,
    gradient: "from-yellow-200/20 to-orange-200/10",
    iconColor: "text-yellow-400"
  },
  {
    id: "meio-dia",
    label: "Meio-dia",
    icon: Sun,
    gradient: "from-cyan-300/20 to-blue-400/10",
    iconColor: "text-cyan-400"
  },
  {
    id: "fim-de-tarde",
    label: "Fim de tarde",
    icon: Sunset,
    gradient: "from-orange-500/20 to-pink-500/10",
    iconColor: "text-orange-400"
  },
  {
    id: "noite",
    label: "Noite",
    icon: Moon,
    gradient: "from-brand-900/30 to-blue-900/20",
    iconColor: "text-brand-400"
  },
  {
    id: "madrugada",
    label: "Madrugada",
    icon: Sparkles,
    gradient: "from-brand-950/40 to-slate-900/40",
    iconColor: "text-brand-400"
  },
];

// TODO: confirmar o rótulo exato desta opção ("Ring light/ideal"?)
export const ILUMINACAO = [
  { id: "natural", label: "Natural suave", icon: Lightbulb, gradient: "from-orange-50/70 to-orange-100/30", iconColor: "text-orange-900" },
  { id: "dourada", label: "Dourada forte", icon: Sun, gradient: "from-amber-400/40 to-yellow-500/20", iconColor: "text-amber-500" },
  { id: "neon", label: "Neon/colorida", icon: Sparkles, gradient: "from-brand-500/30 via-blue-500/20 to-pink-500/30", iconColor: "text-pink-400" },
  { id: "cinematografica", label: "Cinematográfica", icon: Clapperboard, gradient: "from-red-900/40 to-rose-900/20", iconColor: "text-red-400" },
  { id: "ring-light", label: "Ring light/ideal", icon: Circle, gradient: "from-slate-100/70 to-white/40", iconColor: "text-slate-800" },
];

export const ATMOSFERA = [
  { id: "aconchegante", label: "Aconchegante", icon: Flame, gradient: "from-orange-500/30 to-red-500/20", iconColor: "text-orange-400" },
  { id: "moderada", label: "Moderada", icon: Activity, gradient: "from-slate-200/50 to-slate-300/30", iconColor: "text-slate-800" },
  { id: "vibrante", label: "Vibrante", icon: Zap, gradient: "from-pink-500/30 to-orange-500/20", iconColor: "text-pink-400" },
  { id: "luxuosa", label: "Luxuosa", icon: Gem, gradient: "from-amber-300/30 to-yellow-600/20", iconColor: "text-amber-400" },
];
