import { Eye, Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/mock/data";
import { Pill } from "@/components/base/primitives";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "motion/react";

export function ProductCard({
  product,
  selected,
  onClick,
}: {
  product: Product;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[20px] border bg-surface-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        "transition-colors duration-300 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
        selected ? "border-accent-400/50" : "border-border",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-3">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/30" />
        <div className="absolute inset-0 rounded-t-[20px] ring-1 ring-inset ring-white/10" />

        <span className="absolute left-3 top-3">
          <Pill className="border-white/10 bg-black/40 text-white shadow-sm backdrop-blur-md">
            {product.category.split(" & ")[0]}
          </Pill>
        </span>

        {/* Optional viral badge support, driven by data flag */}
        {("viral" in product) && (
          <span className="absolute left-3 top-10">
            {/* Could be a small flame + position badge here */}
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toast.success(product.favorite ? "Removido dos favoritos" : "Adicionado aos favoritos!");
          }}
          className={cn(
            "absolute right-3 top-3 grid size-8 place-items-center rounded-full border border-white/10 backdrop-blur-md transition-colors hover:scale-110",
            product.favorite
              ? "bg-black/40 text-danger"
              : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white",
          )}
        >
          <Heart className="size-4" fill={product.favorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 text-base font-bold text-text-1">{product.name}</h3>

        <div className="mt-1.5 flex items-center gap-3 text-xs text-text-2">
          <span className="flex items-center gap-1.5">
            <ShoppingBag className="size-3.5" />
            {product.sales}
          </span>
          {("views" in product) && (
            <span className="flex items-center gap-1.5">
              <Eye className="size-3.5" />
              {(product as any).views}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <strong className="text-xl font-bold tabular-nums text-text-1">
              {product.price}
            </strong>
            {("revenue" in product) && (
              <span className="ml-2 text-xs text-text-3">
                ~{(product as any).revenue}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4 pt-0 transition-all duration-300 md:absolute md:-bottom-28 md:left-0 md:right-0 md:bg-surface-1/95 md:p-4 md:opacity-0 md:backdrop-blur-md md:group-hover:bottom-0 md:group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toast("Redirecionando para a loja..."); // TODO: Affiliate URL action
          }}
          className="gradient-brand flex h-9 w-full items-center justify-center rounded-full text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Afiliar
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toast.success("Produto selecionado para o estúdio!"); // TODO: redirect to studio
          }}
          className="flex h-9 w-full items-center justify-center rounded-full border border-border bg-surface-2 text-sm font-semibold text-text-1 transition-colors hover:bg-surface-3 active:scale-[0.98]"
        >
          Criar conteúdo
        </button>
      </div>
    </motion.button>
  );
}
