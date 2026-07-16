import { Heart } from "lucide-react";
import { Pill } from "@/components";
import { toast } from "sonner";
import { cn } from "@/utils/utils";
import type { Product } from "@/models/product";

interface ProductMediaProps {
  product: Product;
  onNavigateToCreate: () => void;
}

export function ProductMedia({ product, onNavigateToCreate }: ProductMediaProps) {
  return (
    <div className="relative flex flex-col w-full md:w-[44%] bg-surface-3 md:border-r md:border-white/10 shrink-0 overflow-y-auto p-6 md:p-8 gap-6">
      {/* Image Card */}
      <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 shrink-0">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/30 pointer-events-none" />

        <span className="absolute left-4 top-4">
          <Pill className="border-white/10 bg-black/40 text-white shadow-sm backdrop-blur-md">
            {product.category.split(" & ")[0]}
          </Pill>
        </span>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toast.success(
              product.favorite ? "Removido dos favoritos" : "Adicionado aos favoritos!"
            );
          }}
          className={cn(
            "absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-white/10 backdrop-blur-md transition-colors hover:scale-110",
            product.favorite
              ? "bg-black/40 text-danger"
              : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white"
          )}
        >
          <Heart className="size-5" fill={product.favorite ? "currentColor" : "none"} />
        </button>

        {/* Thumbnails ONLY if there are multiple images */}
        {product.images &&
          product.images.length > 1 && (
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className="size-16 rounded-md border border-white/20 bg-black/40 overflow-hidden shrink-0"
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Actions Moved to Left */}
      <div className="flex flex-col gap-3 mt-auto">
        <div className="mb-1 text-center text-[11px] text-text-3 uppercase tracking-wider font-semibold">
          Fluxo Recomendado: Descobrir &rarr; Afiliar &rarr; Criar
        </div>

        <button
          onClick={() => {
            if (product.affiliateUrl) {
              window.open(product.affiliateUrl, "_blank");
            } else {
              toast.success("Link de afiliado será gerado em breve!"); // TODO
            }
          }}
          className="btn-brand flex h-12 w-full items-center justify-center rounded-[14px] text-base font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Afiliar no TikTok Shop
        </button>

        <button
          onClick={onNavigateToCreate}
          className="flex h-12 w-full items-center justify-center rounded-[14px] border border-border bg-surface-2 text-base font-semibold text-text-1 transition-colors hover:bg-surface-3 active:scale-[0.98]"
        >
          Criar conteúdo
        </button>
      </div>
    </div>
  );
}
