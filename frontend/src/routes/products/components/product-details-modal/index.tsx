import * as React from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, Pencil, Trash2, X } from "lucide-react";

import type { Product } from "@/models/product";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  Dialog, DialogDescription, DialogTitle,
} from "@/components";
import { cn } from "@/utils/utils";
import { useAuth } from "@/context/auth";
import { deleteAdminProduct } from "@/services/productService";

import { deriveProductMetrics } from "@/utils/utils";
import { ProductMedia } from "./components/product-media";
import { ProductInfo } from "./components/product-info";

const GlassDialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    {/* Overlay com blur e menos opacidade para revelar a tela de trás no mesmo estilo da Biblioteca de Avatares */}
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-white/10 data-[state=open]:text-muted-foreground z-50">
        <X className="h-4 w-4 text-white" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
GlassDialogContent.displayName = "GlassDialogContent";

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
        <GlassDialogContent
          className={cn(
            "max-w-[1020px] gap-0 p-0 overflow-hidden border-white/20 bg-zinc-950/50 backdrop-blur-2xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)]",
            "max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0 max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:border-b-0",
            "sm:rounded-2xl"
          )}
        >
          <VisuallyHidden.Root>
            <DialogTitle>Detalhes do Produto: {product.name}</DialogTitle>
            <DialogDescription>Dossiê completo com estatísticas para {product.name}</DialogDescription>
          </VisuallyHidden.Root>


          <div className="flex flex-col md:flex-row h-full max-h-[94dvh] md:max-h-[92vh] overflow-x-hidden">
            {/* LEFT: Media & Main Actions */}
            <ProductMedia product={product} onNavigateToCreate={handleNavigateToCreate} />

            {/* RIGHT: Info + Admin Actions */}
            <div className="flex flex-col w-full md:w-[56%] overflow-y-auto overflow-x-hidden">
              <ProductInfo product={product} metrics={metrics} onNavigateToContent={() => onOpenChange(false)} />

              {/* Admin: Editar / Excluir */}
              {isAdmin && (
                <div className="mt-auto border-t border-white/10 py-3 px-5 md:px-7 flex items-center justify-end gap-3 bg-black/20 shrink-0 overflow-x-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onEdit?.(product);
                    }}
                    className="flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-bold text-zinc-200 transition-all duration-200 hover:bg-white/15 hover:border-white/30 hover:text-white active:scale-95 shadow-sm outline-none cursor-pointer"
                  >
                    <Pencil className="size-4 text-zinc-400" />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex h-10 items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-sm font-bold text-red-400 transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 hover:shadow-[0_0_16px_-4px_rgba(239,68,68,0.5)] active:scale-95 shadow-sm outline-none cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                    <span>Excluir</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </GlassDialogContent>
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
