import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Input } from "@/components";
import type { AvatarFormValues } from "../../index";
import { ImageOptionSelector } from "../image-option-selector";
import { PillSelector } from "../pill-selector";
import { roupaOptions, cenarioOptions } from "../../data";

export function TabEstilo({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="roupa"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Roupa / Estética</FormLabel>
            <FormControl>
              <PillSelector
                options={roupaOptions}
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
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider">Detalhes da Roupa (Opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Ex.: blazer preto minimalista" className="bg-surface-2 border-white/10 text-white h-12 rounded-xl" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cenario"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Cenário de Fundo</FormLabel>
            <FormControl>
              <ImageOptionSelector
                columns={3}
                options={cenarioOptions}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
