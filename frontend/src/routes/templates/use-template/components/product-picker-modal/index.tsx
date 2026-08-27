import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, X, Package, Loader2 } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle } from "@/components";
import { cn } from "@/utils/utils";
import { searchProducts } from "@/services/productService";
import { mapBackendToProduct, type BackendProduct } from "@/models/product-mappers";
import type { Product } from "@/models/product";

/** Mesmo tamanho de página da vitrine (/products), para o scroll infinito ter a mesma cadência. */
const PAGE_SIZE = 20;

const GlassDialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
        <X className="h-4 w-4 text-white" />
        <span className="sr-only">Fechar</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
GlassDialogContent.displayName = "GlassDialogContent";

function ProductCardSmall({ product, onSelect }: { product: Product; onSelect: (p: Product) => void }) {
  const [imgError, setImgError] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="group flex flex-col text-left overflow-hidden rounded-[16px] bg-surface-2 border border-white/5 transition-all hover:border-brand-500/40 hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(75,68,232,0.3)] outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="relative aspect-square bg-white/5 flex items-center justify-center overflow-hidden">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <Package className="size-8 text-white/20" />
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        <span className="truncate text-sm font-semibold text-white" title={product.name}>{product.name}</span>
        <span className="text-xs text-brand-400 font-medium">{product.price}</span>
        <span className="text-[11px] text-white/40">{product.sales}</span>
      </div>
    </button>
  );
}

interface ProductPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: Product) => void;
}

export function ProductPickerModal({ open, onOpenChange, onSelect }: ProductPickerModalProps) {
  const [term, setTerm] = React.useState("");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const reqIdRef = React.useRef(0);
  /** Página já carregada da vitrine — o scroll infinito pede a seguinte. */
  const pageRef = React.useRef(0);
  /**
   * Trava SÍNCRONA de requisição em voo. O estado `loadingMore` só chega ao observer no
   * próximo commit do React, então dois disparos no mesmo frame passariam pela checagem e
   * encadeariam páginas sozinhos.
   */
  const inFlightRef = React.useRef(false);

  const load = React.useCallback(
    async (pageToLoad: number, append: boolean) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      const reqId = ++reqIdRef.current;
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await searchProducts({
          search: term || undefined,
          sort: term ? undefined : "top",
          size: PAGE_SIZE,
          page: pageToLoad,
        });
        if (reqId !== reqIdRef.current) return; // ignora resposta obsoleta (corrida)

        const content = (res.data?.content ?? []) as BackendProduct[];
        const mapped = content.map((p) => mapBackendToProduct(p));
        setProducts((prev) => (append ? [...prev, ...mapped] : mapped));
        setHasMore(!res.data?.last && content.length > 0);
        pageRef.current = pageToLoad;
      } catch {
        if (reqId !== reqIdRef.current) return;
        setHasMore(false);
        if (!append) setProducts([]);
      } finally {
        inFlightRef.current = false;
        if (reqId === reqIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [term],
  );

  // Abertura do modal e cada digitação recomeçam da página 0 (debounce evita uma busca por tecla).
  React.useEffect(() => {
    if (!open) return;
    pageRef.current = 0;
    setHasMore(true);
    setLoading(true);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(0, false), 250);
    return () => clearTimeout(debounceRef.current);
  }, [open, load]);

  // Estado mutável para o observer não precisar ser recriado a cada render (evita loop).
  const scrollState = React.useRef({ hasMore, loading, loadingMore });
  React.useEffect(() => {
    scrollState.current = { hasMore, loading, loadingMore };
  }, [hasMore, loading, loadingMore]);

  const observerRef = React.useRef<IntersectionObserver | null>(null);

  const setSentinelRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      if (!node) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          const { hasMore, loading, loadingMore } = scrollState.current;
          if (hasMore && !loading && !loadingMore) load(pageRef.current + 1, true);
        },
        // Quem rola aqui é o corpo do modal, não a janela. Sem apontar o root para ele, o
        // rootMargin seria medido contra o viewport e o "carregar antes de chegar no fim"
        // não aconteceria (o clip do container zera a interseção de qualquer jeito).
        { root: node.closest('[role="dialog"]'), rootMargin: "200px" },
      );
      observerRef.current.observe(node);
    },
    [load],
  );

  React.useEffect(() => () => observerRef.current?.disconnect(), []);

  const handleSelect = (product: Product) => {
    onSelect(product);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <GlassDialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto border-white/20 bg-zinc-950/50 backdrop-blur-2xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)]">
        <DialogHeader className="mb-2 text-left">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">Catálogo</span>
            <DialogTitle className="text-xl font-extrabold text-white">Escolher produto</DialogTitle>
            <p className="text-sm text-text-2 mt-0.5">Selecione o produto que será aplicado ao vídeo.</p>
          </div>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-brand-400" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-text-3 py-16">Nenhum produto encontrado.</p>
        ) : (
          <div className="flex flex-col gap-5 pb-2">
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {products.map((p) => (
                <ProductCardSmall key={p.id} product={p} onSelect={handleSelect} />
              ))}
            </div>

            {/* Sentinela do scroll infinito: entrou na área visível → carrega a próxima página. */}
            {hasMore && <div ref={setSentinelRef} className="h-px w-full" />}

            {loadingMore && (
              <div className="flex justify-center py-4">
                <Loader2 className="size-5 animate-spin text-brand-400" />
              </div>
            )}
          </div>
        )}
      </GlassDialogContent>
    </Dialog>
  );
}
