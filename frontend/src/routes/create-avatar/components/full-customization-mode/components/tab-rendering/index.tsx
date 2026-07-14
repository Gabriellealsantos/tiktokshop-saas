import { Sparkles } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Textarea } from "@/components";
import type { AvatarFormValues } from "../../index";
import { ImageOptionSelector } from "../image-option-selector";
import { tipoFotoOptions } from "../../data";

export function TabRenderizacao({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  const values = form.getValues();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="tipoFoto"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Tipo de Foto / Câmera</FormLabel>
            <FormControl>
              <ImageOptionSelector
                columns={3}
                options={tipoFotoOptions}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="detalhesExtras"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider">Detalhes Extras (Opcional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Expressão, acessórios, luz..."
                className="bg-surface-2 border-white/10 text-white rounded-xl min-h-[100px] resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="glass-surface p-6 rounded-[24px]">
        <h3 className="text-sm font-semibold text-text-1 mb-4 flex items-center gap-2">
          <Sparkles className="size-4 text-brand-400" /> Resumo do Avatar
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(values).map(([key, val]) => {
            if (!val || key === "nome" || key === "detalhesRoupa" || key === "detalhesExtras") return null;
            return (
              <span key={key} className="inline-flex items-center rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
                {String(val)}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
