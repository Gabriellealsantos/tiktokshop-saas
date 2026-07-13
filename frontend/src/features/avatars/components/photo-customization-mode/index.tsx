import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ChevronLeft, ChevronRight, Camera, X, Image as ImageIcon, Upload, Library, Check } from "lucide-react";

import { cn } from "@/utils/utils";
import { Button, Input, Textarea, Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components";
import { useGenerateAvatar } from "../../api/use-generate-avatar";
import { PreviewPanel } from "../preview-panel";

export const avatarPhotoSchema = z.object({
  nome: z.string().min(1, "O nome do avatar é obrigatório."),
  fotoPrincipal: z.any().refine((file) => file !== null && file !== undefined, "Envie sua foto de rosto."),
  modoRoupa: z.enum(["Automática", "Upload de imagem"]),
  tipoPeca: z.enum(["Look completo", "Parte de cima", "Parte de baixo"]).optional(),
  fotoRoupa: z.any().optional(),
  instrucoesRoupa: z.string().optional(),
  opcoesAdicionais: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.modoRoupa === "Upload de imagem" && !data.fotoRoupa) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Envie a imagem da roupa ou selecione a roupa automática.",
      path: ["fotoRoupa"]
    });
  }
});

export type AvatarPhotoFormValues = z.infer<typeof avatarPhotoSchema>;

const TABS = [
  { id: 1, label: "Sua foto" },
  { id: 2, label: "Roupa" },
];

export function PhotoCustomizationMode() {
  const [activeTab, setActiveTab] = useState(1);
  const generateAvatar = useGenerateAvatar();

  const form = useForm<AvatarPhotoFormValues>({
    resolver: zodResolver(avatarPhotoSchema),
    defaultValues: {
      nome: "",
      modoRoupa: "Automática",
      tipoPeca: "Look completo",
      instrucoesRoupa: "",
      opcoesAdicionais: "",
    },
    mode: "onChange",
  });

  const nome = form.watch("nome");
  const metadata = "Criado a partir de foto";

  const handleNext = () => {
    if (activeTab < 2) setActiveTab((prev) => prev + 1);
    else {
      form.handleSubmit((data) => {
        generateAvatar.mutate(data);
      })();
    }
  };

  const handlePrev = () => {
    if (activeTab > 1) setActiveTab((prev) => prev - 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px] gap-8 items-start">
      {/* ESQUERDA: FORMULÁRIO */}
      <div className="flex flex-col gap-6 w-full">
        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "btn-brand shadow-[0_0_20px_-4px_rgba(75,68,232,0.4)]"
                    : "bg-surface-2 text-text-2 border border-white/5 hover:border-white/10 hover:text-white"
                )}
              >
                {tab.id}. {tab.label}
              </button>
            );
          })}
        </div>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="relative overflow-hidden min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-8 w-full"
              >
                {activeTab === 1 && <TabSuaFoto form={form} />}
                {activeTab === 2 && <TabRoupa form={form} />}
              </motion.div>
            </AnimatePresence>
          </form>
        </Form>

        {/* RODAPÉ DAS TABS */}
        <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={activeTab === 1}
            className="text-text-2 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="size-4 mr-1" /> Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={generateAvatar.isPending}
            className={cn(
              activeTab === 2 ? "bg-brand-500 hover:bg-brand-600 text-white shadow-[0_0_24px_-6px_rgba(75,68,232,0.5)]" : ""
            )}
          >
            {activeTab === 2 ? (
              <>
                <Sparkles className="size-4 mr-2" />
                Gerar avatar com IA
              </>
            ) : (
              <>
                Próximo <ChevronRight className="size-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* DIREITA: PRÉ-VISUALIZAÇÃO STICKY */}
      <PreviewPanel
        nome={nome}
        metadata={metadata}
        isGenerating={generateAvatar.isPending}
        generatedImage={generateAvatar.data || null}
      />
    </div>
  );
}

// ==========================================
// TABS COMPONENTS
// ==========================================

function TabSuaFoto({ form }: { form: UseFormReturn<AvatarPhotoFormValues> }) {
  const fotoPreview = form.watch("fotoPrincipal");

  const handleDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      form.setValue("fotoPrincipal", url);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider">Nome do Avatar</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Aurora, Marcus, Luna..." className="bg-surface-2 border-white/10 text-white h-12 rounded-xl" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fotoPrincipal"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider">Sua Foto (Selfie / Retrato)</FormLabel>
            <FormControl>
              {fotoPreview ? (
                <div className="relative w-full aspect-square max-w-[300px] rounded-2xl overflow-hidden border-2 border-brand-500 shadow-lg mx-auto sm:mx-0">
                  <img src={fotoPreview} alt="Sua foto" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => form.setValue("fotoPrincipal", null)}
                    className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <label className="relative flex flex-col items-center justify-center w-full aspect-video sm:aspect-[21/9] rounded-2xl border-2 border-dashed border-white/20 bg-surface-2 hover:bg-white/5 hover:border-brand-500/50 transition-all cursor-pointer group">
                  <input type="file" accept="image/*" className="hidden" onChange={handleDrop} />
                  <div className="grid size-12 place-items-center rounded-full bg-white/5 group-hover:bg-brand-500/20 text-text-2 group-hover:text-brand-300 transition-colors mb-3">
                    <Camera className="size-6" />
                  </div>
                  <p className="font-semibold text-white">Enviar sua foto</p>
                  <p className="text-sm text-text-3 mt-1">De preferência rosto bem visível e iluminação clara</p>
                </label>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

    </div>
  );
}

function TabRoupa({ form }: { form: UseFormReturn<AvatarPhotoFormValues> }) {
  const modoRoupa = form.watch("modoRoupa");
  const tipoPeca = form.watch("tipoPeca");
  const fotoRoupa = form.watch("fotoRoupa");

  const handleDropRoupa = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      form.setValue("fotoRoupa", url);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="modoRoupa"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider block">Como definir a roupa do avatar</FormLabel>

            <FormControl>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => { form.setValue("modoRoupa", "Automática"); form.setValue("fotoRoupa", null); }}
                  className={cn(
                    "flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all duration-300 outline-none",
                    modoRoupa === "Automática"
                      ? "border-brand-500 bg-brand-500/10 ring-1 ring-brand-500 shadow-[0_0_15px_-3px_rgba(75,68,232,0.3)]"
                      : "border-white/10 bg-surface-2 hover:bg-white/5 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("font-bold", modoRoupa === "Automática" ? "text-brand-300" : "text-text-1")}>Automática</span>
                    {modoRoupa === "Automática" && <div className="size-4 rounded-full bg-brand-500 grid place-items-center"><Sparkles className="size-2.5 text-white" /></div>}
                  </div>
                  <span className="text-xs text-text-3">Usar a roupa que aparece na sua foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => form.setValue("modoRoupa", "Upload de imagem")}
                  className={cn(
                    "flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all duration-300 outline-none",
                    modoRoupa === "Upload de imagem"
                      ? "border-brand-500 bg-brand-500/10 ring-1 ring-brand-500 shadow-[0_0_15px_-3px_rgba(75,68,232,0.3)]"
                      : "border-white/10 bg-surface-2 hover:bg-white/5 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("font-bold", modoRoupa === "Upload de imagem" ? "text-brand-300" : "text-text-1")}>Upload de imagem</span>
                    {modoRoupa === "Upload de imagem" && <div className="size-4 rounded-full bg-brand-500 grid place-items-center"><Upload className="size-2.5 text-white" /></div>}
                  </div>
                  <span className="text-xs text-text-3">Envie um outfit ou use a biblioteca</span>
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <AnimatePresence mode="wait">
        {modoRoupa === "Automática" ? (
          <motion.div
            key="auto"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-brand-500/5 border border-brand-500/20 p-4 rounded-xl flex items-start gap-3"
          >
            <Sparkles className="size-5 text-brand-400 shrink-0 mt-0.5" />
            <p className="text-sm text-text-2 leading-relaxed">
              A roupa do avatar será <strong className="text-white font-medium">exatamente a mesma que aparece na foto</strong> que você enviou na etapa anterior.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-8"
          >
            {/* TIPO DE PEÇA */}
            <FormField
              control={form.control}
              name="tipoPeca"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <p className="text-text-2 text-xs font-bold uppercase tracking-wider block">Tipo da peça enviada</p>
                  <FormControl>
                    <div className="flex flex-wrap gap-2 w-full">
                      {(["Look completo", "Parte de cima", "Parte de baixo"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => form.setValue("tipoPeca", opt)}
                          className={cn(
                            "flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                            tipoPeca === opt
                              ? "bg-brand-500/15 border border-brand-500 text-brand-300 shadow-[0_0_20px_-4px_rgba(75,68,232,0.3)] pr-8"
                              : "bg-surface-2 border border-white/5 text-text-2 hover:border-white/15 hover:text-white"
                          )}
                        >
                          {opt}
                          {tipoPeca === opt && (
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 grid size-4 place-items-center rounded-full bg-brand-500 text-white">
                              <Check className="size-2.5" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* IMAGEM DA ROUPA */}
            <FormField
              control={form.control}
              name="fotoRoupa"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <p className="text-text-2 text-xs font-bold uppercase tracking-wider block">Imagem da Roupa</p>
                  <FormControl>
                    {fotoRoupa ? (
                      <div className="flex flex-col items-start gap-4">
                        <div className="relative w-[150px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-brand-500 shadow-lg">
                          <img src={fotoRoupa} alt="Sua roupa" className="w-full h-full object-cover bg-surface-1" />
                          <button
                            type="button"
                            onClick={() => form.setValue("fotoRoupa", null)}
                            className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                        <Button type="button" variant="outline" onClick={() => form.setValue("fotoRoupa", null)} className="h-8 text-xs bg-surface-2">
                          Trocar outfit
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 max-w-[500px]">
                        <label className="relative flex flex-col items-center justify-center p-6 aspect-square rounded-2xl border-2 border-dashed border-white/20 bg-surface-2 hover:bg-white/5 hover:border-brand-500/50 transition-all cursor-pointer group text-center">
                          <input type="file" accept="image/*" className="hidden" onChange={handleDropRoupa} />
                          <ImageIcon className="size-8 text-text-3 group-hover:text-brand-400 transition-colors mb-4" />
                          <p className="font-medium text-white text-sm leading-tight whitespace-nowrap">Enviar imagem</p>
                        </label>

                        <button type="button" className="relative flex flex-col items-center justify-center p-6 aspect-square rounded-2xl border-2 border-dashed border-white/20 bg-surface-2 hover:bg-white/5 hover:border-brand-500/50 transition-all group text-center">
                          <Library className="size-8 text-text-3 group-hover:text-brand-400 transition-colors mb-4" />
                          <p className="font-medium text-white text-sm leading-tight whitespace-nowrap">Biblioteca de outfits</p>
                        </button>
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* INSTRUCOES OPCIONAIS */}
            <FormField
              control={form.control}
              name="instrucoesRoupa"
              render={({ field }) => (
                <FormItem>
                  <p className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2">Instruções sobre a roupa (Opcional)</p>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: mudar a cor para branco, manga curta ao invés de longa, sem o cinto..."
                      className="bg-surface-2 border-white/10 text-white rounded-xl resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-4 border-t border-white/5">
        <FormField
          control={form.control}
          name="opcoesAdicionais"
          render={({ field }) => (
            <FormItem>
              <p className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2">Opções Adicionais (Opcional)</p>
              <FormControl>
                <Textarea
                  placeholder="Ex: tatuagem no braço, brinco prateado, piercing no nariz..."
                  className="bg-surface-2 border-white/10 text-white rounded-xl min-h-[80px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
