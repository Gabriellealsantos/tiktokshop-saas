import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Input } from "@/components";
import type { AvatarFormValues } from "../../index";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ImageOptionSelector } from "../image-option-selector";
import { roupaSugestoes } from "../../data";
import { cn } from "@/utils/utils";

export function TabEstilo({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  const generoVal = form.watch("genero");
  const isMasculino = generoVal === "Masculino";

  const dynamicRoupaOptions = [
    { name: "Casual", image: isMasculino ? "/casual-masc.png" : "/casual-fem.png" },
    { name: "Luxo", image: isMasculino ? "/luxo-masc.png" : "/luxo-fem.png" },
    { name: "Streetwear", image: isMasculino ? "/streetwear-masc.png" : "/streetwear-fem.png" },
    { name: "Fitness", image: isMasculino ? "/fitness-masc.png" : "/fitness-fem.png" },
    { name: "Corporativo", image: isMasculino ? "/corporativo-masc.png" : "/corporativo-fem.png" }
  ];

  const estiloSelecionado = form.watch("roupa");
  const detalhesVal = form.watch("detalhesRoupa") || "";
  const maxDetalhesLength = 120;
  const sugestoes = estiloSelecionado ? roupaSugestoes[estiloSelecionado] : undefined;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="roupa"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Roupa / Estética</FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={dynamicRoupaOptions}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="detalhesRoupa"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between items-end mb-2">
              <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-0 block">Detalhes da Roupa (Opcional)</FormLabel>
              <span className="text-[10px] text-text-3 font-medium">
                {detalhesVal.length}/{maxDetalhesLength}
              </span>
            </div>
            <FormControl>
              <div className="relative group">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-text-3 group-focus-within:text-brand-500 transition-colors" />
                <Input
                  placeholder="Ex.: blazer preto minimalista"
                  className="bg-surface-2 border-white/10 text-white h-14 rounded-xl pl-12 focus-visible:ring-brand-500 focus-visible:border-brand-500 transition-all"
                  maxLength={maxDetalhesLength}
                  {...field}
                  value={field.value || ""}
                />
              </div>
            </FormControl>
            <AnimatePresence mode="popLayout">
              {sugestoes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-3 mb-2 ml-1">Inspire-se</p>
                  <div className="flex flex-wrap gap-2">
                    {sugestoes.map((sugestao, idx) => {
                      const isSelected = detalhesVal.trim() === sugestao;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => form.setValue("detalhesRoupa", sugestao, { shouldValidate: true, shouldDirty: true })}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                            isSelected
                              ? "bg-brand-500/20 text-brand-400 border border-brand-500/50"
                              : "bg-surface-2 text-text-3 border border-white/5 hover:bg-surface-3 hover:text-text-2"
                          )}
                        >
                          {sugestao}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <FormMessage />
          </FormItem>
        )}
      />


    </div>
  );
}
