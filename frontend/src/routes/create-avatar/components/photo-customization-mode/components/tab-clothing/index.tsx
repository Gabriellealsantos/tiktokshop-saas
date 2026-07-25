import type { UseFormReturn } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Upload, Check, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/utils/utils";
import {
  Button,
  Textarea,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components";
import type { AvatarPhotoFormValues } from "../../schema";
import { useState } from "react";

export function TabRoupa({
  form,
}: {
  form: UseFormReturn<AvatarPhotoFormValues>;
}) {
  const modoRoupa = form.watch("modoRoupa");
  const tipoPeca = form.watch("tipoPeca");

  const [roupaPreview, setRoupaPreview] = useState<string | null>(null);

  const handleDropRoupa = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    form.setValue("fotoRoupa", file, { shouldValidate: true });
    setRoupaPreview(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="modoRoupa"
        render={() => (
          <FormItem className="space-y-4">
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider block">
              Como definir a roupa do avatar
            </FormLabel>

            <FormControl>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    form.setValue("modoRoupa", "Automática");
                    form.setValue("fotoRoupa", null);
                    setRoupaPreview(null);
                  }}
                  className={cn(
                    "flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all duration-300 outline-none",
                    modoRoupa === "Automática"
                      ? "border-brand-500 bg-brand-500/10 ring-1 ring-brand-500 shadow-[0_0_15px_-3px_rgba(75,68,232,0.3)]"
                      : "btn-3d-neutral",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "font-bold",
                        modoRoupa === "Automática"
                          ? "text-brand-300"
                          : "text-text-1",
                      )}
                    >
                      Automática
                    </span>
                    {modoRoupa === "Automática" && (
                      <div className="size-4 rounded-full bg-brand-500 grid place-items-center">
                        <Sparkles className="size-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-text-3">
                    Usar a roupa que aparece na sua foto
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => form.setValue("modoRoupa", "Upload de imagem")}
                  className={cn(
                    "flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all duration-300 outline-none",
                    modoRoupa === "Upload de imagem"
                      ? "border-brand-500 bg-brand-500/10 ring-1 ring-brand-500 shadow-[0_0_15px_-3px_rgba(75,68,232,0.3)]"
                      : "btn-3d-neutral",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "font-bold",
                        modoRoupa === "Upload de imagem"
                          ? "text-brand-300"
                          : "text-text-1",
                      )}
                    >
                      Upload de imagem
                    </span>
                    {modoRoupa === "Upload de imagem" && (
                      <div className="size-4 rounded-full bg-brand-500 grid place-items-center">
                        <Upload className="size-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-text-3">
                    Envie um outfit ou use a biblioteca
                  </span>
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
              A roupa do avatar será{" "}
              <strong className="text-white font-medium">
                exatamente a mesma que aparece na foto
              </strong>{" "}
              que você enviou na etapa anterior.
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
              render={() => (
                <FormItem className="space-y-3">
                  <p className="text-text-2 text-xs font-bold uppercase tracking-wider block">
                    Tipo da peça enviada
                  </p>
                  <FormControl>
                    <div className="flex flex-wrap gap-2 w-full">
                      {(
                        [
                          "Look completo",
                          "Parte de cima",
                          "Parte de baixo",
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => form.setValue("tipoPeca", opt)}
                          className={cn(
                            "flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                            tipoPeca === opt
                              ? "bg-brand-500/15 border border-brand-500 text-brand-300 shadow-[0_0_20px_-4px_rgba(75,68,232,0.3)] pr-8"
                              : "btn-3d-neutral text-text-2 hover:text-white",
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
              render={() => (
                <FormItem className="space-y-3">
                  <p className="text-text-2 text-xs font-bold uppercase tracking-wider block">
                    Imagem da Roupa
                  </p>
                  <FormControl>
                    {roupaPreview ? (
                      <div className="flex flex-col items-start gap-4">
                        <div className="relative w-[150px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-brand-500 shadow-lg">
                          <img
                            src={roupaPreview}
                            alt="Sua roupa"
                            className="w-full h-full object-cover bg-surface-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              form.setValue("fotoRoupa", null, {
                                shouldValidate: true,
                              });
                              setRoupaPreview(null);
                            }}
                            className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            form.setValue("fotoRoupa", null, {
                              shouldValidate: true,
                            });
                            setRoupaPreview(null);
                          }}
                          className="h-8 text-xs bg-surface-2"
                        >
                          Trocar outfit
                        </Button>
                      </div>
                    ) : (
                      <div className="flex max-w-[250px]">
                        <label className="w-full relative flex flex-col items-center justify-center p-6 aspect-square rounded-2xl border-2 border-dashed border-white/20 bg-surface-2 hover:bg-white/5 hover:border-brand-500/50 transition-all cursor-pointer group text-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleDropRoupa}
                          />
                          <ImageIcon className="size-8 text-text-3 group-hover:text-brand-400 transition-colors mb-4" />
                          <p className="font-medium text-white text-sm leading-tight whitespace-nowrap">
                            Enviar imagem
                          </p>
                        </label>
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
                  <p className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2">
                    Instruções sobre a roupa (Opcional)
                  </p>
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
              <p className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2">
                Opções Adicionais (Opcional)
              </p>
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
