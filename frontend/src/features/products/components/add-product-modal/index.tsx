import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Upload, Link as LinkIcon, Plus, Info, LayoutDashboard, X, Image as ImageIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import { useMockSession } from "@/context/mock-session";
import { ProductCard, Dialog, DialogContent, DialogDescription, DialogTitle, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from "@/components";
import { categories, products, type Product } from "@/services/data";
import { ContentGenerationOptions } from "../content-generation-options";

import { cn } from "@/utils/utils";



const formSchema = z.object({
  // 1. Mídia
  image: z.string().min(1, { message: "Imagem obrigatória" }),
  images: z.string().optional(),

  // 2. Básico
  name: z.string().min(3, { message: "Nome muito curto" }),
  category: z.string().min(1, { message: "Selecione um tipo" }),
  price: z.coerce.number().min(0, { message: "Preço inválido" }).optional(),

  // 3. Estatísticas
  sales: z.string().optional(),
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
  affiliateUrl: z.string().url({ message: "URL do TikTok Shop inválida" }).optional().or(z.literal("")),
});

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProductModal({ open, onOpenChange }: AddProductModalProps) {
  const { role } = useMockSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: "",
      images: "",
      name: "",
      category: "",
      price: 0,
      sales: "0 vendas",
      views: 0,
      revenueEstimate: 0,
      conversionRate: 0,
      commissionRate: 15,
      salesPerDay: 0,
      trendLabel: "",
      rankInCategory: 0,
      salesHistory7d: "",
      miningWindow: "12:00–18:00",
      viral: false,
      favorite: false,
      affiliateUrl: "",
    },
  });


  const watchAllFields = form.watch();
  const canSubmit = !!watchAllFields.image && !!watchAllFields.name && !!watchAllFields.category;

  const previewProduct: Product = {
    id: 9999,
    name: watchAllFields.name || "Nome do Produto",
    category: watchAllFields.category || "Categoria",
    price: !isNaN(Number(watchAllFields.price)) && watchAllFields.price ? `R$ ${Number(watchAllFields.price).toFixed(2).replace(".", ",")}` : "R$ 0,00",
    sales: watchAllFields.sales || "0 vendas",
    image: watchAllFields.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
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
      ? watchAllFields.salesHistory7d.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n))
      : undefined,
  };

  if (watchAllFields.images) {
    const arr = watchAllFields.images.split(",").map(s => s.trim()).filter(Boolean);
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

  function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Formato inválido", { description: "Por favor, envie apenas imagens." });
      return;
    }
    const url = URL.createObjectURL(file);
    form.setValue("image", url, { shouldValidate: true, shouldDirty: true });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(">>> HANDLER CHAMADO", values);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      
      const newId = Math.max(0, ...products.map(p => p.id)) + 1;
      const newProduct = { ...previewProduct, id: newId };
      products.unshift(newProduct);
      setCreatedProduct(newProduct);
      
      toast.success("Produto adicionado com sucesso!", {
        description: "Disponível na vitrine de Produtos Virais.",
      });
      setStep(2);
      console.log(">>> ETAPA MUDOU PARA: 2");
    }, 1500);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[1200px] gap-0 p-0 overflow-hidden border-white/10 bg-surface-1 text-text-1 shadow-2xl",
          "max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0 max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:border-b-0",
          "sm:rounded-2xl"
        )}
      >
        <VisuallyHidden.Root>
          <DialogTitle>Adicionar Novo Produto</DialogTitle>
          <DialogDescription>Formulário de cadastro para a vitrine de produtos virais.</DialogDescription>
        </VisuallyHidden.Root>

        <div className="flex flex-col lg:flex-row h-full max-h-[90dvh] md:max-h-[85vh] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col lg:flex-row h-full w-full"
              >
                {/* LEFT/FORM: scrolls internally */}
          <div className="flex-1 min-h-0 p-6 md:p-8 overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Adicionar Produto</h2>
              <p className="text-sm text-zinc-400 mt-1">Preencha os campos para rastrear um novo produto na vitrine.</p>
            </div>

            <Form {...form}>
              <form 
                id="add-product-form" 
                className="space-y-6"
              >

                {/* 1. Mídia */}
                <div className="p-5 rounded-2xl border border-white/5 bg-surface-2/30 space-y-4">
                  <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                    <Upload className="size-4 text-brand-400" />
                    1. Mídia
                  </h3>
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Upload de Imagem *</FormLabel>
                          <FormControl>
                            <div 
                              className={cn(
                                "relative w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors cursor-pointer overflow-hidden",
                                field.value 
                                  ? "border-transparent bg-surface-2" 
                                  : "border-white/10 bg-surface-1 hover:border-brand-500/50 hover:bg-surface-2"
                              )}
                              onClick={() => !field.value && fileInputRef.current?.click()}
                              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              onDrop={handleDrop}
                            >
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file);
                                }}
                              />
                              
                              {field.value ? (
                                <>
                                  <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      field.onChange("");
                                      if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                                  >
                                    <X className="size-4" />
                                  </button>
                                </>
                              ) : (
                                <div className="text-center p-4">
                                  <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-2 text-brand-400">
                                    <Upload className="size-5" />
                                  </div>
                                  <p className="text-sm font-medium text-text-1">Clique para enviar ou arraste</p>
                                  <p className="text-xs text-text-3 mt-1">PNG, JPG ou WEBP (Max. 5MB)</p>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 2. Básico */}
                <div className="p-5 rounded-2xl border border-white/5 bg-surface-2/30 space-y-4">
                  <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                    <LayoutDashboard className="size-4 text-brand-400" />
                    2. Informações Básicas
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="text-xs">Nome do Produto *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Ring Light Profissional" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Tipo *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-sm bg-surface-1 border-white/10">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Preço (R$) *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                  </div>
                </div>

                {/* 3. Estatísticas */}
                {role === "admin" && (
                  <div className="p-5 rounded-2xl border border-white/5 bg-surface-2/30 space-y-4">
                    <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                      <Info className="size-4 text-brand-400" />
                      3. Estatísticas de Venda
                    </h3>
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="sales"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Texto de Vendas *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 4.5 mil vendas" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="views"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Visualizações</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Ex: 150000" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="revenueEstimate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Receita (R$)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Auto" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="conversionRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Conversão (%)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="commissionRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Comissão (%)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="salesPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Vendas/dia</FormLabel>
                            <FormControl>
                              <Input type="number" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="trendLabel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Label Tendência</FormLabel>
                            <FormControl>
                              <Input placeholder="Em alta" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="salesHistory7d"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel className="text-xs">Histórico 7 Dias (ex: 10,12,15)</FormLabel>
                            <FormControl>
                              <Input placeholder="12, 15, 20, 18, 25, 30, 45" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* 4. Origem/Meta */}
                {role === "admin" && (
                  <div className="p-5 rounded-2xl border border-white/5 bg-surface-2/30 space-y-4">
                    <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                      <Plus className="size-4 text-brand-400" />
                      4. Origem & Destaques
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="miningWindow"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Janela de Mineração</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 text-sm bg-surface-1 border-white/10">
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="00:00–06:00">00:00–06:00</SelectItem>
                                <SelectItem value="06:00–12:00">06:00–12:00</SelectItem>
                                <SelectItem value="12:00–18:00">12:00–18:00</SelectItem>
                                <SelectItem value="18:00–00:00">18:00–00:00</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <div className="flex flex-col gap-3">
                        <FormField
                          control={form.control}
                          name="viral"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 bg-surface-1 px-3 py-2">
                              <div className="space-y-0.5">
                                <FormLabel className="text-xs">Produto Viral (🔥)</FormLabel>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="favorite"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 bg-surface-1 px-3 py-2">
                              <div className="space-y-0.5">
                                <FormLabel className="text-xs">Favorito Inicial</FormLabel>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Afiliação */}
                {role === "admin" && (
                  <div className="p-5 rounded-2xl border border-white/5 bg-surface-2/30 space-y-4">
                    <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                      <LinkIcon className="size-4 text-brand-400" />
                      5. Afiliação TikTok Shop
                    </h3>
                    <FormField
                      control={form.control}
                      name="affiliateUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Link do Produto *</FormLabel>
                          <FormControl>
                            <Input placeholder="https://shop.tiktok.com/..." className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </form>
            </Form>
          </div>

          {/* RIGHT: Live Preview & Submit */}
          <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-white/10 bg-surface-2/20 flex flex-col p-6 lg:p-8 shrink-0 overflow-y-auto lg:overflow-visible">
            <h3 className="text-sm font-bold text-white mb-4">Preview em Tempo Real</h3>
            <div className="w-full mx-auto opacity-95 pointer-events-none mb-6 max-w-[320px]">
              <ProductCard product={previewProduct} />
            </div>

            <div className="mt-auto pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={form.handleSubmit(onSubmit, (errors) => console.log(">>> ERRO DE VALIDAÇÃO IMPEDIU O SUBMIT:", errors))}
                disabled={isSubmitting || !canSubmit}
                className="btn-brand flex h-12 w-full items-center justify-center rounded-[14px] text-base font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? "Salvando..." : "Adicionar ao Estúdio"}
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
                  <button 
                    onClick={() => setStep(1)}
                    className="mb-8 flex items-center gap-2 text-sm text-text-3 hover:text-text-1 transition-colors"
                  >
                    <ArrowLeft className="size-4" />
                    Voltar para edição
                  </button>

                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Produto salvo com sucesso! 🎉</h2>
                    <p className="text-text-2">O produto "{createdProduct.name}" foi adicionado ao seu estúdio. Como você deseja criar conteúdo para ele agora?</p>
                  </div>

                  <ContentGenerationOptions product={createdProduct} onNavigate={() => handleOpenChange(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
