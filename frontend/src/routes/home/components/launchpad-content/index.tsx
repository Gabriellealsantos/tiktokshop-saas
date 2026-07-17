import { Link, useNavigate } from "react-router-dom";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { Boxes, Loader2, Search, TrendingUp, WandSparkles } from "lucide-react";
import { Button, Pill, SelectableCard, SectionTitle } from "@/components";
import type { Product } from "@/models/product";
import { mapBackendToProduct, type BackendProduct } from "@/models/product-mappers";
import { searchProducts } from "@/services/productService";

export function LaunchpadContent({ renderHeader }: { renderHeader?: ReactNode }) {
  const navigate = useNavigate();
  const modules = [
    ["Mineração de Produtos", "Descubra oportunidades antes da saturação.", Boxes, "/products"],
    [
      "Gerador de Avatar",
      "Crie creators consistentes para seus vídeos.",
      WandSparkles,
      "/avatars",
    ],
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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
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
    <>
      {renderHeader}
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-500">Central de criação</h2>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-.035em] text-white md:text-4xl">
          O que você vai criar hoje?
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Transforme sinais de mercado em conteúdo pronto para produzir.
        </p>
      </div>

      <div ref={boxRef} className="entrance relative">
        <div className="glass-surface p-3 md:flex md:items-center">
          <div className="flex flex-1 items-center gap-3 px-3">
            <Search className="size-5 text-text-3" />
            <input
              aria-label="Buscar produto ou ideia"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={() => {
                if (suggestions.length) setOpen(true);
              }}
              className="h-12 w-full bg-transparent text-sm text-text-1 placeholder:text-text-3 outline-none"
              placeholder="Busque um produto, nicho ou ideia viral..."
            />
          </div>
          <Button size="lg" className="w-full md:w-auto" onClick={() => goMine()}>
            <TrendingUp />
            Minerar
          </Button>
        </div>

        {open && term.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur">
            {suggestLoading && suggestions.length === 0 ? (
              <div className="flex items-center gap-2 px-4 py-3 text-xs text-text-3">
                <Loader2 className="size-3.5 animate-spin" /> Buscando…
              </div>
            ) : suggestions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-text-3">Nenhum produto encontrado.</div>
            ) : (
              suggestions.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => goMine(s.name)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    i === activeIndex ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  {s.image ? (
                    <img src={s.image} alt="" className="size-8 rounded-lg object-cover" />
                  ) : (
                    <div className="grid size-8 place-items-center rounded-lg bg-white/5">
                      <Search className="size-3.5 text-text-3" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-text-1">{s.name}</p>
                    <p className="mt-0.5 text-[10px] text-text-3">{s.sales}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <section className="mt-10">
        <SectionTitle
          title="Atalhos criativos"
          description="Continue do ponto certo para sua próxima peça."
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {modules.map(([title, description, Icon, to], index) => (
            <Link
              to={to}
              key={title}
              style={{ animationDelay: `${index * 60}ms` }}
              className="entrance"
            >
              <SelectableCard title={title} description={description} icon={Icon} />
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-10">
        <div className="glass-surface p-5">
          <SectionTitle
            title="Top Produtos"
            description="Tempo real"
            action={<Pill tone="success">ONLINE</Pill>}
          />
          <div className="space-y-1">
            {topLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-xs text-text-3">
                <Loader2 className="size-4 animate-spin" /> Carregando…
              </div>
            ) : topError ? (
              <div className="py-8 text-center text-xs text-text-3">
                Não foi possível carregar.{" "}
                <button onClick={loadTop} className="text-brand-400 underline">
                  Tentar novamente
                </button>
              </div>
            ) : topProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-3">Nenhum produto ainda.</div>
            ) : (
              topProducts.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => goMine(product.name)}
                  className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <span className="w-5 text-xs font-bold text-text-3">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {product.image ? (
                    <img src={product.image} alt="" className="size-10 rounded-lg object-cover" />
                  ) : (
                    <div className="grid size-10 place-items-center rounded-lg bg-white/5">
                      <TrendingUp className="size-4 text-text-3" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{product.name}</p>
                    <p className="mt-1 text-[10px] text-text-3">{product.sales}</p>
                  </div>
                  <TrendingUp className="size-4 text-success" />
                </button>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
