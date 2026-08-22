import { Link, useNavigate } from "react-router-dom";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { Boxes, Loader2, Search, TrendingUp, WandSparkles, ArrowRight, Flame, Activity, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components";
import { cn } from "@/utils/utils";
import { useAuth } from "@/context/auth";
import type { Product } from "@/models/product";
import { mapBackendToProduct, type BackendProduct } from "@/models/product-mappers";
import { searchProducts } from "@/services/productService";

import imgMineracao from "@/assets/central-capa-mineracao-produtos.jpeg";
import imgAvatar from "@/assets/central-capa-gerador-avatar.jpeg";
import imgTemplates from "@/assets/central-capa-templates-virais.jpeg";
import imgTrend from "@/assets/central-capa-trendAi.png";


export function LaunchpadContent({ renderHeader }: { renderHeader?: ReactNode }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(" ")[0] : "Criador";

  const modules = [
    ["Mineração de Produtos", "/products", imgMineracao],
    ["Gerador de Avatar", "/create-avatar", imgAvatar],
    ["Templates Virais", "/templates", imgTemplates],
    ["Trend Boost", "/trend-boost", imgTrend],
  ] as const;

  // --- Top Produtos (ranking real por vendas/dia) ---
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [topLoading, setTopLoading] = useState(true);
  const [topError, setTopError] = useState(false);

  const loadTop = useCallback(async () => {
    setTopLoading(true);
    setTopError(false);
    try {
      const res = await searchProducts({ sort: "top", size: 5 });
      const content = (res.data?.content ?? []) as BackendProduct[];
      setTopProducts(content.map((p) => mapBackendToProduct(p)));
    } catch {
      setTopError(true);
    } finally {
      setTopLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTop();
  }, [loadTop]);

  // --- Busca com autocomplete ---
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  const goMine = (q?: string) => {
    const value = (q ?? term).trim();
    setOpen(false);
    navigate(value ? `/products?search=${encodeURIComponent(value)}` : "/products");
  };

  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      setSuggestLoading(false);
      return;
    }
    setSuggestLoading(true);
    const myReq = ++reqIdRef.current;
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchProducts({ search: q, size: 6 });
        if (myReq !== reqIdRef.current) return; // ignora resposta obsoleta
        const content = (res.data?.content ?? []) as BackendProduct[];
        setSuggestions(content.map((p) => mapBackendToProduct(p)));
        setActiveIndex(-1);
        setOpen(true);
      } catch {
        if (myReq === reqIdRef.current) {
          setSuggestions([]);
          setOpen(true);
        }
      } finally {
        if (myReq === reqIdRef.current) setSuggestLoading(false);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [term]);

  // fecha o dropdown ao clicar fora
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length) {
        setOpen(true);
        setActiveIndex((i) => (i + 1) % suggestions.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length) {
        setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && activeIndex >= 0 && suggestions[activeIndex]) {
        goMine(suggestions[activeIndex].name);
      } else {
        goMine();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto -mt-6 md:-mt-12">
      {/* 1. Greeting header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 mt-4 md:mt-8 flex flex-col md:flex-row md:items-end justify-between gap-5 relative z-50"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-.035em] text-white md:text-4xl">
            Olá, {firstName} 👋
          </h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-xl">
            Bem-vindo de volta. Pratique sua mineração diária e explore novos formatos.
          </p>
        </div>

        {renderHeader && (
          <div className="flex shrink-0">
            {renderHeader}
          </div>
        )}
      </motion.div>

      {/* 2. Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        ref={boxRef}
        className="relative z-30 mb-8"
      >
        <div className="glass-premium-purple rounded-2xl p-1.5 flex flex-col md:flex-row items-center focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500/50 transition-all duration-300">
          <div className="flex flex-1 items-center gap-3 px-4 py-2 w-full">
            <Search className="size-5 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
            <input
              aria-label="Buscar produto ou ideia"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={() => {
                if (suggestions.length) setOpen(true);
              }}
              className="h-10 md:h-12 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none border-none focus:ring-0 focus:border-transparent focus:outline-none"
              placeholder="Busque um produto, nicho ou ideia viral..."
            />
          </div>
          <Button size="lg" className="w-full md:w-auto rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-[0_0_15px_rgba(var(--color-brand-500),0.2)] hover:shadow-[0_0_20px_rgba(var(--color-brand-500),0.4)] transition-all font-semibold" onClick={() => goMine()}>
            <TrendingUp className="mr-2 size-4" />
            Minerar
          </Button>
        </div>

        {open && term.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl">
            {suggestLoading && suggestions.length === 0 ? (
              <div className="flex items-center justify-center gap-2 px-4 py-6 text-xs text-zinc-400">
                <Loader2 className="size-4 animate-spin" /> Buscando…
              </div>
            ) : suggestions.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-zinc-400">Nenhum produto encontrado.</div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto p-1.5">
                {suggestions.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => goMine(s.name)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      i === activeIndex ? "bg-white/10" : "hover:bg-white/5"
                    )}
                  >
                    {s.image ? (
                      <img src={s.image} alt="" className="size-10 rounded-lg object-cover border border-white/10" />
                    ) : (
                      <div className="grid size-10 place-items-center rounded-lg bg-white/5 border border-white/5">
                        <Search className="size-4 text-zinc-500" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{s.name}</p>
                      <p className="mt-0.5 text-[11px] font-medium text-brand-400">{s.sales}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* 3. HERO CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-premium-purple rounded-[32px] p-6 md:p-10 mb-5"
      >
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          {/* Left Column (Text) */}
          <div className="w-full md:w-[35%] flex flex-col justify-center">
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
              O que você vai <br className="hidden md:block" />
              <span className="text-brand-400">criar hoje?</span>
            </h3>
            <p className="text-sm text-white">
              Da mineração do produto ao vídeo final. Tudo o que você precisa para dominar o algoritmo.
            </p>
          </div>

          {/* Right Column (Image-tiles Grid) */}
          <div className="w-full md:w-[65%] grid grid-cols-2 md:grid-cols-4 gap-4">
            {modules.map(([title, to, bgImage], index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Link
                  to={to}
                  className="group relative flex flex-col justify-end h-[220px] md:h-[280px] rounded-2xl border border-white/10 overflow-hidden hover:border-brand-500/50 hover:shadow-[0_0_20px_rgba(var(--color-brand-500),0.15)] transition-all duration-300"
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                    style={{ backgroundImage: `url('${bgImage}')` }}
                  />

                  {/* Dark scrim for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Hover effect gradient overlay */}
                  <div className="absolute inset-0 bg-brand-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay" />

                  <div className="relative p-4 flex flex-col gap-2 mt-auto">
                    <h4 className="text-sm font-bold text-white leading-tight">{title}</h4>
                    <ArrowRight className="size-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 4. Minimalist Status Graphic */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-premium-purple rounded-[24px] p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 mt-6 border border-white/10 relative overflow-hidden"
      >
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-md bg-brand-500/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4 text-left w-full">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="absolute flex h-10 w-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500/20 opacity-75"></span>
            </span>
            <div className="relative size-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(109,91,245,0.2)]">
              <Activity className="size-4 text-brand-400" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Monitoramento Ativo</h3>
            <p className="text-[13px] text-zinc-400">
              Nossa IA está rastreando a rede em tempo real para capturar os próximos produtos e vídeos virais.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

