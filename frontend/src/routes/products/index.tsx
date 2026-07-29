import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Pill, Page, PageHeader, ProductCard } from "@/components";
import { ProductDetailsModal } from "./components/product-details-modal";
import { AddProductModal } from "./components/add-product-modal";
import { AppShell } from "@/layouts/app-shell";
import type { Product } from "@/models/product";
import type { Category } from "@/models/category";
import {
  mapBackendToProduct,
  type BackendProduct,
} from "@/models/product-mappers";
import {
  favoriteProduct,
  getFavorites,
  searchProducts,
  unfavoriteProduct,
} from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import { useDocumentTitle } from "@/utils/use-document-title";
import { cn } from "@/utils/utils";

// Abas fixas (não são categorias do backend): Favoritos e Top Produtos.
const FIXED_TABS = ["Favoritos", "Top Produtos"];

export default function ProductsScreen() {
  useDocumentTitle("Produtos Virais");
  const [addProductOpen, setAddProductOpen] = useState(false);
  // Produto em edição (admin). null = modal de "Meu produto" abre em modo criação.
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState("Top Produtos");
  // Semeia a busca a partir da URL (ex.: navegação vinda da Central via ?search=).
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Ids favoritados, para marcar o coração em qualquer aba (não só na de Favoritos).
  const [favIds, setFavIds] = useState<Set<number>>(new Set());
  // Categorias reais do backend (viram abas dinâmicas depois das fixas).
  const [cats, setCats] = useState<Category[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    getCategories()
      .then((res) => setCats((res.data ?? []) as Category[]))
      .catch(() => {
        /* silencioso: mantém só as abas fixas */
      });
  }, []);

  const tabs = [...FIXED_TABS, ...cats.map((c) => c.name)];

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkScroll, 50);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, tabs]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleNativeWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
        const canScroll =
          (e.deltaY > 0 && el.scrollLeft < el.scrollWidth - el.clientWidth - 1) ||
          (e.deltaY < 0 && el.scrollLeft > 0);

        if (canScroll) {
          e.preventDefault();
          el.scrollBy({ left: e.deltaY * 2, behavior: "smooth" });
        }
      }
    };

    el.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleNativeWheel);
  }, [tabs]);

  // Carrega os ids favoritados uma vez (usado para marcar o coração nas outras abas).
  const loadFavIds = useCallback(async () => {
    try {
      const res = await getFavorites();
      setFavIds(new Set((res.data as BackendProduct[]).map((p) => p.id)));
    } catch {
      // silencioso
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      if (category === "Favoritos") {
        const res = await getFavorites();
        const items = (res.data as BackendProduct[]).map((p) => mapBackendToProduct(p, true));
        const term = search.trim().toLowerCase();
        setList(term ? items.filter((p) => p.name.toLowerCase().includes(term)) : items);
      } else {
        // "Top Produtos" = todas (sem filtro). Categoria real → filtra pelo slug.
        const slug = cats.find((c) => c.name === category)?.slug;
        const res = await searchProducts({
          category: category === "Top Produtos" ? undefined : slug,
          search: search.trim() || undefined,
          size: 40,
        });
        const content = (res.data?.content ?? []) as BackendProduct[];
        setList(content.map((p) => mapBackendToProduct(p, favIds.has(p.id))));
      }
    } catch {
      setError(true);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, favIds, cats]);

  useEffect(() => {
    loadFavIds();
  }, [loadFavIds]);

  // Debounce simples da busca + recarrega ao trocar de categoria.
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(load, 250);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [load]);

  const handleToggleFavorite = async (product: Product) => {
    const currentlyFav = favIds.has(product.id);
    // Atualiza otimista (set + lista).
    setFavIds((prev) => {
      const next = new Set(prev);
      if (currentlyFav) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
    setList((prev) =>
      category === "Favoritos" && currentlyFav
        ? prev.filter((p) => p.id !== product.id)
        : prev.map((p) => (p.id === product.id ? { ...p, favorite: !currentlyFav } : p)),
    );
    try {
      if (currentlyFav) await unfavoriteProduct(product.id);
      else await favoriteProduct(product.id);
    } catch {
      toast.error("Não foi possível atualizar os favoritos.");
      loadFavIds();
      load();
    }
  };

  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Mineração de produtos"
          title="Produtos Virais"
          description="Oportunidades rastreadas e organizadas por força de demanda."
          actions={<Pill tone="success">Sistema online · minerando</Pill>}
        />
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center justify-between w-full">
          {/* Carrossel de Categorias (Rolagem horizontal fluida com fades nas bordas e sem quebra de linha) */}
          <div className="relative flex-1 min-w-0 w-full lg:w-auto overflow-hidden">
            {/* Fade à esquerda (aparece após rolagem) */}
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-10 bg-linear-to-r from-[var(--bg-base)] to-transparent pointer-events-none z-10 transition-opacity duration-300",
                canScrollLeft ? "opacity-100" : "opacity-0"
              )}
            />

            {/* Faixa em linha única rolável e sem barra nativa visível */}
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex items-center gap-2 overflow-x-auto flex-nowrap py-1 px-1 no-scrollbar scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {tabs.map((cat) => (
                <Pill
                  key={cat}
                  active={category === cat}
                  onClick={() => setCategory(cat)}
                  className="shrink-0"
                >
                  {cat}
                </Pill>
              ))}
            </div>

            {/* Fade à direita (indica que há mais itens a rolar) */}
            <div
              className={cn(
                "absolute right-0 top-0 bottom-0 w-10 bg-linear-to-l from-[var(--bg-base)] to-transparent pointer-events-none z-10 transition-opacity duration-300",
                canScrollRight ? "opacity-100" : "opacity-0"
              )}
            />
          </div>

          {/* Campo de busca + Botão Meu produto Fixo (fora do carrossel, shrink-0 garantido) */}
          <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 z-10">
            <div className="glass-surface is-interactive flex h-11 flex-1 lg:w-64 xl:w-80 items-center gap-3 rounded-[12px] px-4">
              <Search className="size-4 text-text-3" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto..."
                className="w-full bg-transparent text-sm text-text-1 placeholder:text-text-3 outline-none"
              />
            </div>
            <button
              onClick={() => {
                setProductToEdit(null);
                setAddProductOpen(true);
              }}
              className="btn-brand flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] px-5 text-sm font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="size-4" />
              Meu produto
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-16 flex items-center justify-center gap-2 text-sm text-text-3">
            <Loader2 className="size-4 animate-spin" /> Carregando produtos…
          </div>
        ) : error ? (
          <div className="mt-16 text-center text-sm text-text-3">
            Não foi possível carregar os produtos.{" "}
            <button onClick={load} className="text-brand-400 underline">Tentar novamente</button>
          </div>
        ) : list.length === 0 ? (
          <div className="mt-16 text-center text-sm text-text-3">
            {category === "Favoritos"
              ? "Você ainda não favoritou nenhum produto."
              : "Nenhum produto encontrado."}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {list.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

        <ProductDetailsModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onOpenChange={(open) => !open && setSelectedProduct(null)}
          onDeleted={() => {
            setSelectedProduct(null);
            load();
          }}
          onEdit={(product) => {
            setSelectedProduct(null);
            setProductToEdit(product);
            setAddProductOpen(true);
          }}
        />
        <AddProductModal
          open={addProductOpen}
          onOpenChange={(open) => {
            setAddProductOpen(open);
            if (!open) setProductToEdit(null);
          }}
          productToEdit={productToEdit}
          onCreated={() => {
            loadFavIds();
            load();
          }}
        />
      </Page>
    </AppShell>
  );
}
