import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Pill, Page, PageHeader, ProductCard } from "@/components";
import { ProductDetailsModal } from "./components/product-details-modal";
import { AddProductModal } from "./components/add-product-modal";
import { AppShell } from "@/layouts/app-shell";
import type { Product } from "@/models/product";
import {
  categoryLabelToEnum,
  mapBackendToProduct,
  type BackendProduct,
} from "@/models/product-mappers";
import {
  favoriteProduct,
  getFavorites,
  searchProducts,
  unfavoriteProduct,
} from "@/services/productService";
import { useDocumentTitle } from "@/utils/use-document-title";

const CATS = [
  "Favoritos",
  "Top Produtos",
  "Beleza & Cuidados",
  "Casa & Decoração",
  "Saúde & Fitness",
  "Moda & Estilo",
  "Tecnologia",
  "Acessórios",
];

export default function ProductsScreen() {
  useDocumentTitle("Produtos Virais");
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [category, setCategory] = useState("Top Produtos");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Ids favoritados, para marcar o coração em qualquer aba (não só na de Favoritos).
  const [favIds, setFavIds] = useState<Set<number>>(new Set());

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
        const res = await searchProducts({
          category: categoryLabelToEnum(category),
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
  }, [category, search, favIds]);

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
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1 lg:flex-none">
            {CATS.map((cat) => (
              <Pill key={cat} active={category === cat} onClick={() => setCategory(cat)}>
                {cat}
              </Pill>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
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
              onClick={() => setAddProductOpen(true)}
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
        />
        <AddProductModal
          open={addProductOpen}
          onOpenChange={setAddProductOpen}
          onCreated={() => {
            loadFavIds();
            load();
          }}
        />
      </Page>
    </AppShell>
  );
}
