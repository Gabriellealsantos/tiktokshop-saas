import { useMemo, useState } from "react";
import { Clock3, Plus, Search, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Pill, Page, PageHeader, ProductCard } from "@/components";
import { ProductDetailsModal } from "./components/product-details-modal";
import { AddProductModal } from "./components/add-product-modal";
import { AppShell } from "@/layouts/app-shell";
import { products, type Product } from "@/services/data";

export function ProductsScreen() {
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [category, setCategory] = useState("Top Produtos");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const list = useMemo(
    () =>
      products
        .filter(
          (product) =>
            (category === "Top Produtos" ||
              (category === "Favoritos" && product.favorite) ||
              product.category.includes(category.split(" & ")[0])) &&
            product.name.toLowerCase().includes(search.toLowerCase()),
        )
        .slice(0, 20),
    [category, search],
  );
  const cats = [
    "Favoritos",
    "Top Produtos",
    "Beleza & Cuidados",
    "Casa & Decoração",
    "Saúde & Fitness",
    "Moda & Estilo",
    "Tecnologia",
    "Acessórios",
  ];
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
            {cats.map((cat) => (
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
        <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {list.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>

        <ProductDetailsModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onOpenChange={(open) => !open && setSelectedProduct(null)}
        />
        <AddProductModal
          open={addProductOpen}
          onOpenChange={setAddProductOpen}
        />

      </Page>
    </AppShell>
  );
}
