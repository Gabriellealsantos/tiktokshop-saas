import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Loader2, Pencil, Trash2 } from "lucide-react";

import type { Product } from "@/models/product";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  Dialog, DialogContent, DialogDescription, DialogTitle,
} from "@/components";
import { cn } from "@/utils/utils";
import { useAuth } from "@/context/auth";
import { deleteAdminProduct } from "@/services/productService";

import { deriveProductMetrics } from "@/utils/utils";
import { ProductMedia } from "./components/product-media";
import { ProductInfo } from "./components/product-info";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
  /** Admin: abre o produto no modal de edição. */
  onEdit?: (product: Product) => void;
}

export function ProductDetailsModal({ product, isOpen, onOpenChange, onDeleted, onEdit }: ProductDetailsModalProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!product) return null;

  const metrics = deriveProductMetrics(product);

  const handleNavigateToCreate = () => {
    toast.success("Redirecionando para criação com este produto...");
    onOpenChange(false);
    const params = new URLSearchParams(searchParams);
    params.set("productId", String(product.id));
    navigate(`/create-from-scratch?${params.toString()}`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAdminProduct(product.id);
      toast.success("Produto excluído com sucesso!");
      setConfirmDelete(false);
      onOpenChange(false);
      onDeleted?.();
    } catch {
      toast.error("Falha ao excluir produto.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
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

            {/* RIGHT: Info + Admin Actions */}
            <div className="flex flex-col w-full md:w-[56%] overflow-y-auto bg-surface-1">
              <ProductInfo product={product} metrics={metrics} onNavigateToContent={() => onOpenChange(false)} />

              {/* Admin: Editar / Excluir */}
              {isAdmin && (
                <div className="border-t border-white/10 p-6 md:px-8 flex items-center gap-3">
                  <button
                    onClick={() => {
                      onOpenChange(false);
                      onEdit?.(product);
                    }}
                    className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-surface-2 px-4 text-sm font-semibold text-text-1 transition-colors hover:bg-surface-3"
                  >
                    <Pencil className="size-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex h-10 items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                  >
                    <Trash2 className="size-4" />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="border-white/10 bg-surface-1 text-text-1">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription className="text-text-2">
              O produto <strong>"{product.name}"</strong> será removido permanentemente do catálogo. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="border-white/10 bg-surface-2 text-text-1 hover:bg-surface-3">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? <><Loader2 className="size-4 animate-spin mr-2" /> Excluindo…</> : "Sim, excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
