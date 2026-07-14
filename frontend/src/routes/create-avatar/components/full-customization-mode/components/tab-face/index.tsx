import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components";
import type { AvatarFormValues } from "../../index";
import { ImageOptionSelector } from "../image-option-selector";
import { ColorSwatchSelector } from "../color-swatch-selector";
import { PillSelector } from "../pill-selector";
import { formatoRostoOptions, corOlhosOptions, expressaoOptions, pelosFaciaisOptions } from "../../data";

export function TabRosto({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="formatoRosto"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Formato do Rosto</FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={formatoRostoOptions}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="corOlhos"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Cor dos Olhos</FormLabel>
            <FormControl>
              <ColorSwatchSelector
                options={corOlhosOptions}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="expressao"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Expressão</FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={expressaoOptions}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="pelosFaciais"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Pelos Faciais</FormLabel>
            <FormControl>
              <PillSelector
                options={pelosFaciaisOptions}
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
