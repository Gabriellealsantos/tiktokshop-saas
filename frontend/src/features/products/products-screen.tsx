import { useMemo, useState } from "react";
import { Clock3, Plus, Search, ShoppingBag, TrendingUp, Upload } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button, Pill } from "@/components/base/primitives";
import { Field, TextArea } from "@/components/base/form-controls";
import { Page, PageHeader } from "@/components/base/page";
import { ProductCard } from "@/components/cards/product-card";
import { ProductDetailsModal } from "./components/product-details-modal";
import { AddProductModal } from "./components/add-product-modal";
import { AppShell } from "@/layouts/app-shell";
import { products, type Product } from "@/mock/data";
import { Route } from "@/routes/produtos";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ProductsScreen() {
  const { novoProduto } = Route.useSearch();
  const navigate = Route.useNavigate();
  const isAddProductOpen = String(novoProduto) === "1";

  const handleAddProductOpenChange = (open: boolean) => {
    navigate({
      search: (prev) => ({ ...prev, novoProduto: open ? "1" : undefined }),
      replace: true,
    });
  };

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
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="panel p-5">
            <p className="text-xs text-text-2">Novos produtos</p>
            <strong className="mt-2 block text-3xl tabular-nums">91</strong>
          </div>
          <div className="panel p-5">
            <p className="text-xs text-text-2">Receita detectada</p>
            <strong className="mt-2 block text-3xl text-success">R$ 4,5M</strong>
          </div>
          <div className="panel p-5">
            <p className="flex items-center gap-2 text-xs text-text-2">
              <Clock3 className="size-3" />
              Próxima atualização
            </p>
            <strong className="mt-2 block text-3xl tabular-nums">04:38</strong>
          </div>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {["00:00–06:00", "06:00–12:00", "12:00–18:00", "18:00–00:00"].map((range, i) => (
            <Pill key={range} active={i === 2}>
              {range}
            </Pill>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 lg:flex-row">
          <div className="flex h-11 flex-1 items-center gap-3 rounded-[12px] border border-border bg-surface-1 px-4">
            <Search className="size-4 text-text-3" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto..."
              className="w-full bg-transparent text-sm placeholder:text-text-3"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {cats.map((cat) => (
              <Pill key={cat} active={category === cat} onClick={() => setCategory(cat)}>
                {cat}
              </Pill>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          isOpen={isAddProductOpen}
          onOpenChange={handleAddProductOpenChange}
        />
        <div className="panel mt-8 flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-bold">Não encontrou seu produto?</h2>
            <p className="mt-1 text-sm text-text-2">
              Adicione um item próprio e leve-o direto para o Estúdio.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus />
                Usar meu próprio produto
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border bg-elevated text-text-1">
              <DialogHeader>
                <DialogTitle>Adicionar Produto</DialogTitle>
                <DialogDescription>
                  Os dados ficam apenas nesta sessão demonstrativa.
                </DialogDescription>
              </DialogHeader>
              <button className="grid min-h-32 place-items-center rounded-[14px] border border-dashed border-border bg-deep text-text-2 hover:border-accent-400/40">
                <span className="grid place-items-center gap-2 text-xs">
                  <Upload className="size-5" />
                  Enviar imagem
                </span>
              </button>
              <Field label="Nome do produto" placeholder="Ex.: Kit de skincare" />
              <TextArea label="Descrição" placeholder="Destaques e diferenciais do produto" />
              <Button>
                <ShoppingBag />
                Adicionar ao Estúdio
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </Page>
    </AppShell>
  );
}
