import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, Slider } from "@/components";
import type { AvatarFormValues } from "../../index";
import { ImageOptionSelector } from "../image-option-selector";
import { tipoFisicoOptions } from "../../data";

export function TabCorpo({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  const alturaVal = form.watch("altura");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="tipoFisico"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Tipo Físico</FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={tipoFisicoOptions}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="altura"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider flex justify-between">
              <span>Altura</span>
              <span className="text-brand-300">{alturaVal} cm</span>
            </FormLabel>
            <FormControl>
              <Slider
                min={150}
                max={200}
                step={1}
                value={[field.value]}
                onValueChange={(val) => field.onChange(val[0])}
                className="py-2"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
