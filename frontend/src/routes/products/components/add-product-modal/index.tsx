import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import axios from "axios";

import { useMockSession } from "@/context/mock-session";
import {
  ProductCard,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Form,
} from "@/components";
import { type Product } from "@/data/mock";
import type { Category } from "@/models/category";
import {
  mapBackendToProduct,
  toProductDTO,
  productToFormValues,
  type BackendProduct,
} from "@/models/product-mappers";
import {
  createAdminProduct,
  updateAdminProduct,
  uploadProductImage,
} from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import { createUserProduct } from "@/services/userProductService";
import { ContentGenerationOptions } from "../content-generation-options";

import { SectionMedia } from "./components/section-media";
import { SectionBasic } from "./components/section-basic";
import { SectionStats } from "./components/section-stats";
import { SectionOrigin } from "./components/section-origin";
import { SectionAffiliate } from "./components/section-affiliate";
import { cn } from "@/utils/utils";

const formSchema = z.object({
  // 1. Mídia
  image: z.string().min(1, { message: "Imagem obrigatória" }),
  images: z.string().optional(),

  // 2. Básico
  name: z.string().min(3, { message: "Nome muito curto" }),
  // Categoria (id) só é exigida no fluxo admin — validada em canSubmit/onSubmit.
  category: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Preço inválido" }).optional(),

  // 3. Estatísticas
  sales: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  reviewsCount: z.coerce.number().min(0).optional(),
  views: z.coerce.number().min(0).optional(),
  revenueEstimate: z.coerce.number().min(0).optional(),
  conversionRate: z.coerce.number().min(0).max(100).optional(),
  commissionRate: z.coerce.number().min(0).max(100).optional(),
  salesPerDay: z.coerce.number().min(0).optional(),
  trendLabel: z.string().optional(),
  rankInCategory: z.coerce.number().min(1).optional(),
  salesHistory7d: z.string().optional(),

  // 4. Origem/Meta
  miningWindow: z.string().optional(),
  viral: z.boolean(),
  favorite: z.boolean(),

  // 5. Afiliação
  affiliateUrl: z
    .string()
    .url({ message: "URL do TikTok Shop inválida" })
    .optional()
    .or(z.literal("")),
});

export type AddProductFormValues = z.infer<typeof formSchema>;

const BLANK_DEFAULTS: AddProductFormValues = {
  image: "",
  images: "",
  name: "",
  category: "",
  price: 0,
  sales: "0 vendas",
  rating: 5.0,
  reviewsCount: 0,
  views: 0,
  revenueEstimate: 0,
  conversionRate: 0,
  commissionRate: 15,
  salesPerDay: 0,
  trendLabel: "",
  rankInCategory: undefined,
  salesHistory7d: "",
  miningWindow: "12:00–18:00",
  viral: false,
  favorite: false,
  affiliateUrl: "",
};

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  /** Quando presente, o modal abre em modo edição (admin) desse produto. */
  productToEdit?: Product | null;
}

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
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-3 top-3 md:right-4 md:top-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-md opacity-80 ring-offset-background cursor-pointer transition-all hover:opacity-100 hover:bg-black/70 hover:scale-105 focus:outline-none shadow-md">
        <X className="h-4 w-4 text-white" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
GlassDialogContent.displayName = "GlassDialogContent";

export function AddProductModal({
  open,
  onOpenChange,
  onCreated,
  productToEdit,
}: AddProductModalProps) {
  const { role } = useMockSession();
  const isAdmin = role === "admin";
  const isEditing = !!productToEdit;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categorias da vitrine (só o admin usa o select).
  useEffect(() => {
    if (!open || !isAdmin) return;
    getCategories()
      .then((res) => setCats((res.data ?? []) as Category[]))
      .catch(() => {
        /* silencioso */
      });
  }, [open, isAdmin]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: BLANK_DEFAULTS,
  });

  // Ao abrir: em modo edição pré-preenche com o produto; em modo criação garante form limpo.
  useEffect(() => {
    if (!open) return;
    form.reset(
      productToEdit ? productToFormValues(productToEdit) : BLANK_DEFAULTS,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, productToEdit]);

  const watchAllFields = form.watch();
  const canSubmit =
    !!watchAllFields.image &&
    !!watchAllFields.name &&
    (!isAdmin || !!watchAllFields.category) &&
    !isUploading;

  const previewProduct: Product = {
    id: 9999,
    name: watchAllFields.name || "Nome do Produto",
    category:
      cats.find((c) => String(c.id) === watchAllFields.category)?.name ||
      "Categoria",
    price:
      !isNaN(Number(watchAllFields.price)) && watchAllFields.price
        ? `R$ ${Number(watchAllFields.price).toFixed(2).replace(".", ",")}`
        : "R$ 0,00",
    sales: watchAllFields.sales || "0 vendas",
    image:
      watchAllFields.image ||
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    rating: watchAllFields.rating || undefined,
    reviewsCount: watchAllFields.reviewsCount || undefined,
    favorite: watchAllFields.favorite,
    views: watchAllFields.views || undefined,
    revenueEstimate: watchAllFields.revenueEstimate || undefined,
    conversionRate: watchAllFields.conversionRate || undefined,
    commissionRate: watchAllFields.commissionRate || undefined,
    salesPerDay: watchAllFields.salesPerDay || undefined,
    trendLabel: watchAllFields.trendLabel || undefined,
    rankInCategory: watchAllFields.rankInCategory || undefined,
    miningWindow: watchAllFields.miningWindow || undefined,
    viral: watchAllFields.viral,
    affiliateUrl: watchAllFields.affiliateUrl || undefined,
    salesHistory7d: watchAllFields.salesHistory7d
      ? watchAllFields.salesHistory7d
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => !isNaN(n))
      : undefined,
  };

  if (watchAllFields.images) {
    const arr = watchAllFields.images
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (arr.length > 0) {
      previewProduct.images = arr;
    }
  }

  function handleOpenChange(open: boolean) {
    onOpenChange(open);
    if (!open) {
      setTimeout(() => {
        setStep(1);
        setCreatedProduct(null);
        form.reset();
      }, 300);
    }
  }

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Formato inválido", {
        description: "Por favor, envie apenas imagens.",
      });
      return;
    }
    // Mostra um blob local enquanto faz o upload real
    const localPreview = URL.createObjectURL(file);
    form.setValue("image", localPreview, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setIsUploading(true);
    try {
      const res = await uploadProductImage(file);
      const realUrl = res.data?.url || res.data;
      if (typeof realUrl === "string" && realUrl.startsWith("http")) {
        form.setValue("image", realUrl, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      toast.success("Imagem enviada com sucesso!");
    } catch {
      toast.error("Falha ao enviar imagem", {
        description: "Tente novamente.",
      });
      form.setValue("image", "", { shouldValidate: true, shouldDirty: true });
    } finally {
      URL.revokeObjectURL(localPreview);
      setIsUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      if (isEditing && productToEdit) {
        // Modo edição (admin): atualiza o produto existente e fecha — sem passo de gerar conteúdo.
        const dto = toProductDTO({
          ...values,
          image: values.image,
          name: values.name,
          category: values.category ?? "",
        });
        await updateAdminProduct(productToEdit.id, dto);
        toast.success("Produto atualizado com sucesso!", {
          description: "As alterações já estão na vitrine de Produtos Virais.",
        });
        onCreated?.();
        handleOpenChange(false);
        return;
      }

      if (role === "admin") {
        // Admin: cria produto no catálogo com todos os campos ricos.
        const dto = toProductDTO({
          ...values,
          image: values.image,
          name: values.name,
          category: values.category ?? "",
        });
        const res = await createAdminProduct(dto);
        const created = res.data as BackendProduct;
        setCreatedProduct(mapBackendToProduct(created));
      } else {
        // Usuário: cria UserProduct (só nome, descrição, imagem).
        await createUserProduct({
          name: values.name,
          imageUrl: values.image,
          description: null,
        });
        // UserProduct não devolve um Product completo, construímos um mínimo para o step 2.
        setCreatedProduct({
          id: Date.now(),
          name: values.name,
          category: values.category || "Meus Produtos",
          price: values.price
            ? `R$ ${values.price.toFixed(2).replace(".", ",")}`
            : "R$ 0,00",
          sales: "0 vendas",
          image: values.image,
          favorite: false,
          viral: false,
        });
      }

      toast.success("Produto adicionado com sucesso!", {
        description:
          role === "admin"
            ? "Disponível na vitrine de Produtos Virais."
            : "Adicionado à sua lista de produtos.",
      });
      setStep(2);
      onCreated?.();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ||
          err.response?.data?.error ||
          "Erro inesperado ao salvar."
        : "Erro inesperado ao salvar.";
      toast.error("Falha ao salvar produto", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <GlassDialogContent
        className={cn(
          "max-w-[1200px] w-[95vw] sm:w-[95vw] gap-0 p-0 overflow-hidden border-white/20 bg-zinc-950/50 backdrop-blur-2xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl"
        )}
      >
        <VisuallyHidden.Root>
          <DialogTitle>Adicionar Novo Produto</DialogTitle>
          <DialogDescription>
            Formulário de cadastro para a vitrine de produtos virais.
          </DialogDescription>
        </VisuallyHidden.Root>

        <div className="flex flex-col lg:flex-row h-full max-h-[90dvh] md:max-h-[85vh] relative overflow-y-auto lg:overflow-hidden">
          <AnimatePresence>
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col lg:flex-row h-auto lg:h-full w-full"
              >
                {/* LEFT/FORM: scrolls internally only on desktop */}
                <div className="flex-1 lg:min-h-0 p-6 md:p-8 lg:overflow-y-auto shrink-0">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {isEditing
                        ? "Editar Produto"
                        : isAdmin
                          ? "Adicionar Produto"
                          : "Adicionar Meu Produto"}
                    </h2>
                    <p className="text-sm text-zinc-400 mt-1">
                      {isEditing
                        ? "Ajuste os campos e salve as alterações na vitrine."
                        : isAdmin
                          ? "Preencha os campos para rastrear um novo produto na vitrine."
                          : "Envie a imagem e dê um nome ao seu produto para gerar conteúdo com ele."}
                    </p>
                  </div>

                  <Form {...form}>
                    <form id="add-product-form" className="space-y-6">
                      {/* 1. Mídia */}
                      <SectionMedia
                        form={form}
                        fileInputRef={fileInputRef}
                        handleDrop={handleDrop}
                        handleImageUpload={handleImageUpload}
                      />

                      {isUploading && (
                        <p className="text-xs text-brand-400 animate-pulse">
                          Enviando imagem…
                        </p>
                      )}

                      {/* 2. Básico */}
                      <SectionBasic
                        form={form}
                        isAdmin={isAdmin}
                        categories={cats}
                      />

                      {/* 3. Estatísticas */}
                      {role === "admin" && <SectionStats form={form} />}

                      {/* 4. Origem/Meta */}
                      {role === "admin" && <SectionOrigin form={form} />}

                      {/* 5. Afiliação */}
                      {role === "admin" && <SectionAffiliate form={form} />}
                    </form>
                  </Form>
                </div>

                {/* RIGHT: Live Preview & Submit */}
                <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-white/10 bg-black/20 flex flex-col p-6 lg:p-8 shrink-0 lg:overflow-hidden lg:h-full">
                  <h3 className="shrink-0 text-sm font-bold text-white mb-4">
                    Preview em Tempo Real
                  </h3>
                  <div className="w-full mx-auto opacity-95 pointer-events-none mb-6 max-w-80 lg:flex-1 lg:min-h-0 flex flex-col shrink-0 h-[460px] lg:h-auto">
                    <ProductCard 
                      product={previewProduct} 
                      className="h-full" 
                      imageClassName="lg:aspect-auto lg:flex-1 lg:min-h-0 lg:shrink" 
                    />
                  </div>

                  <div className="shrink-0 mt-auto pt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={form.handleSubmit(onSubmit, (errors) => {
                        toast.error("Confira os campos destacados.");
                      })}
                      disabled={isSubmitting || !canSubmit}
                      className="btn-brand flex h-12 w-full items-center justify-center rounded-[14px] text-base font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isSubmitting
                        ? "Salvando..."
                        : isUploading
                          ? "Enviando imagem…"
                          : isEditing
                            ? "Salvar alterações"
                            : "Adicionar ao Estúdio"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && createdProduct && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="w-full flex items-center justify-center p-6 md:p-12 overflow-y-auto"
              >
                <div className="max-w-xl w-full">
                  {isAdmin ? (
                    <>
                      {/* Admin gerencia o catálogo: mantém a confirmação de que o produto foi salvo. */}
                      <button
                        onClick={() => setStep(1)}
                        className="mb-8 flex items-center gap-2 text-sm text-text-3 hover:text-text-1 transition-colors"
                      >
                        <ArrowLeft className="size-4" />
                        Voltar para edição
                      </button>

                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">
                          Produto salvo com sucesso! 🎉
                        </h2>
                        <p className="text-text-2">
                          O produto "{createdProduct.name}" foi adicionado ao
                          seu estúdio. Como você deseja criar conteúdo para ele
                          agora?
                        </p>
                      </div>
                    </>
                  ) : (
                    /* Cliente/afiliado: tela focada no produto — sem revelar a mecânica de salvar. */
                    <div className="mb-8 flex flex-col items-center text-center">
                      <div className="size-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-surface-2">
                        <img
                          src={createdProduct.image}
                          alt={createdProduct.name}
                          className="size-full object-cover"
                        />
                      </div>
                      <h2 className="mt-5 text-2xl font-bold text-white">
                        {createdProduct.name}
                      </h2>
                      <p className="mt-1.5 text-text-3">
                        Como você quer criar conteúdo para este produto?
                      </p>
                    </div>
                  )}

                  <ContentGenerationOptions
                    product={createdProduct}
                    onNavigate={() => handleOpenChange(false)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassDialogContent>
    </Dialog>
  );
}
