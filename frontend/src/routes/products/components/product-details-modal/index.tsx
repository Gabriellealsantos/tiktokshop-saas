import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import type { Product } from "@/services/data";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components";
import { cn } from "@/utils/utils";

import { deriveProductMetrics } from "@/utils/utils";
import { ProductMedia } from "./components/product-media";
import { ProductInfo } from "./components/product-info";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsModal({ product, isOpen, onOpenChange }: ProductDetailsModalProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (!product) return null;

  const metrics = deriveProductMetrics(product);

  const handleNavigateToCreate = () => {
    toast.success("Redirecionando para criação com este produto...");
    onOpenChange(false);
    const params = new URLSearchParams(searchParams);
    params.set("productId", String(product.id));
    navigate(`/create-from-scratch?${params.toString()}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[1000px] gap-0 p-0 overflow-hidden border-white/10 bg-surface-1 text-text-1 shadow-2xl",
          "max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0 max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:border-b-0",
          "sm:rounded-2xl"
        )}
      >
        <VisuallyHidden.Root>
          <DialogTitle>Detalhes do Produto: {product.name}</DialogTitle>
          <DialogDescription>Dossiê completo com estatísticas para {product.name}</DialogDescription>
        </VisuallyHidden.Root>

        <div className="flex flex-col md:flex-row h-full max-h-[90dvh] md:max-h-[85vh]">
          {/* LEFT: Media & Main Actions */}
          <ProductMedia product={product} onNavigateToCreate={handleNavigateToCreate} />

          {/* RIGHT: Info + New Actions */}
          <ProductInfo product={product} metrics={metrics} onNavigateToContent={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
