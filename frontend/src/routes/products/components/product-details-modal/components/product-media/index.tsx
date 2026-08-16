import { useState } from "react";
import { Heart, ImageOff, ChevronRight, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils/utils";
import type { Product } from "@/models/product";
import { favoriteProduct, unfavoriteProduct } from "@/services/productService";
import { useEffect } from "react";

interface ProductMediaProps {
  product: Product;
  onNavigateToCreate: () => void;
}

export function ProductMedia({ product }: ProductMediaProps) {
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(product.favorite);

  useEffect(() => {
    setIsFavorite(product.favorite);
  }, [product.favorite]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const previousState = isFavorite;
    setIsFavorite(!previousState);
    product.favorite = !previousState; // optimistic mutation on the prop as well just in case
    
    try {
      if (previousState) {
        await unfavoriteProduct(product.id);
        toast.success("Removido dos favoritos");
      } else {
        await favoriteProduct(product.id);
        toast.success("Adicionado aos favoritos!");
      }
    } catch (error) {
      setIsFavorite(previousState);
      product.favorite = previousState;
      toast.error("Erro ao atualizar favorito");
    }
  };

  return (
    <div className="relative flex flex-col w-full md:w-[44%] shrink-0 justify-between md:overflow-hidden overflow-x-hidden p-4 md:p-7 gap-4 md:gap-5 md:h-full">
      {/* Image Card Container restored to full previous size with Premium Glow & Glass Feel */}
      <div className="group relative w-full aspect-square md:aspect-auto md:flex-1 md:min-h-0 rounded-[24px] overflow-hidden border border-white/15 bg-linear-to-b from-white/[0.07] to-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] shrink-0 md:shrink transition-all duration-300">
        {!product.image || imageError ? (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-500/20 via-zinc-900/80 to-zinc-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="size-16 rounded-2xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md flex items-center justify-center mb-3 text-white/40 group-hover:text-brand-400 group-hover:scale-110 transition-all duration-500">
              <ImageOff className="size-7" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-zinc-400">Imagem indisponível</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-black/30 pointer-events-none" />

        {/* Category Chip -> Illuminated Pulsing Jewel Capsule */}
        <div className="absolute left-4 top-4 z-20">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-300 hover:scale-105">
            <div className="size-1.5 rounded-full bg-brand-400 animate-pulse shadow-[0_0_8px_#8b5cf6]" />
            <span className="text-[11px] font-extrabold text-white tracking-wide uppercase">
              {product.category.split(" & ")[0]}
            </span>
          </div>
        </div>

        {/* Favorite Button -> Interactive Circular Jewel Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={cn(
            "absolute right-4 top-4 z-20 size-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] hover:scale-110 hover:border-white/40 active:scale-95 cursor-pointer outline-none",
            isFavorite ? "text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]" : "text-white/80 hover:text-white"
          )}
          aria-label="Favoritar produto"
        >
          <Heart className="size-5 transition-transform duration-300 hover:scale-110" fill={isFavorite ? "currentColor" : "none"} />
        </button>

        {/* Thumbnails ONLY if there are multiple images */}
        {product.images &&
          product.images.length > 1 && (
            <div className="absolute bottom-4 left-4 right-4 flex gap-2.5 overflow-x-auto z-20 scrollbar-hide">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className="size-14 rounded-xl border border-white/30 bg-black/70 backdrop-blur-md overflow-hidden shrink-0 transition-all duration-300 hover:scale-110 hover:border-brand-400 shadow-md"
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Botões ocultos no mobile (movidos para o InfoComponent) */}
      <div className="hidden md:flex flex-col gap-5 shrink-0">
        {/* Recommended Flow Stepper -> Framed ultra-transparent container with optimized padding */}
        <div className="w-full p-4 md:py-4.5 md:px-5 rounded-[20px] bg-white/[0.03] border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col items-center gap-3 backdrop-blur-md shrink-0">
          <span className="text-[11px] font-black text-brand-400/90 uppercase tracking-[0.2em] drop-shadow-xs">
            FLUXO RECOMENDADO
          </span>
          <div className="flex items-center justify-center gap-2 w-full">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-[linear-gradient(135deg,rgba(75,68,232,0.25)_0%,rgba(75,68,232,0.10)_100%)] border border-brand-500 text-brand-300 shadow-[0_0_20px_-4px_rgba(75,68,232,0.45)] backdrop-blur-md">
              DESCOBRIR
            </span>
            <ChevronRight className="size-4 text-brand-400/70 shrink-0" />
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-medium bg-white/5 text-zinc-300 border border-white/10 hover:border-white/20 hover:text-white transition-colors">
              AFILIAR
            </span>
            <ChevronRight className="size-4 text-zinc-600 shrink-0" />
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-medium bg-white/5 text-zinc-300 border border-white/10 hover:border-white/20 hover:text-white transition-colors">
              CRIAR
            </span>
          </div>
        </div>

        {/* Primary Action -> Hero-sized Vibrant 3D Gradient Glow Button to balance layout height without gaps */}
        <button
          type="button"
          onClick={() => {
            if (product.affiliateUrl) {
              window.open(product.affiliateUrl, "_blank");
            } else {
              toast.success("Link de afiliado será gerado em breve!");
            }
          }}
          className="group btn-brand gradient-brand luminous-glow relative w-full h-13 md:h-14 overflow-hidden rounded-full font-bold text-white/90 drop-shadow-sm transition-all duration-200 hover:luminous-glow-hover hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] cursor-pointer outline-none shrink-0"
        >
          <div className="relative flex h-full w-full items-center justify-center gap-3 px-6">
            <ShoppingBag className="size-5 text-white drop-shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110 shrink-0" />
            <span className="text-[15px] tracking-wide drop-shadow-xs font-extrabold">Afiliar no TikTok Shop</span>
          </div>
        </button>
      </div>
    </div>
  );
}





