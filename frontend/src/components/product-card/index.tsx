import { Eye, Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/services/data";
import { Pill } from "@/components/primitives";
import { cn } from "@/utils/utils";
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
        "glass-surface is-interactive group relative flex h-full flex-col rounded-[20px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        "transition-all duration-300",
        selected && "border-accent-400/50 shadow-[0_0_20px_rgba(75,68,232,0.15)]",
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-t-[20px] bg-white/5">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
        />

        <span className="absolute left-3 top-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-medium text-white shadow-sm backdrop-blur-md uppercase tracking-wider">
            {product.category.split(" & ")[0]}
          </span>
        </span>

        {("viral" in product && product.viral) && (
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

      <div className="flex flex-1 flex-col p-4 gap-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-text-1 leading-snug">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 mt-auto pt-1">
          <Pill className="border-white/10 bg-surface-2 text-text-1 font-bold text-[11px] px-2 py-1 whitespace-nowrap shrink-0">
            {product.price}
          </Pill>
          <Pill className="border-white/10 bg-surface-2 text-text-2 text-[11px] px-2 py-1 flex items-center gap-1 whitespace-nowrap min-w-0 overflow-hidden shrink">
            <span className="text-warning text-[10px]">★</span>
            <span className="font-medium truncate">5.0 (24)</span>
          </Pill>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toast("Redirecionando para a loja..."); // TODO: Affiliate URL action
          }}
          className="btn-brand mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-[12px] text-sm font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="text-lg leading-none mb-0.5">+</span> Afiliar-se
        </button>
      </div>
    </motion.button>
  );
}
