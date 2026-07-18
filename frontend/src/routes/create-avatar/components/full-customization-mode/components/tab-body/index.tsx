import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, Slider } from "@/components";
import type { AvatarFormValues } from "../../index";
import { ImageOptionSelector } from "../image-option-selector";

export function TabCorpo({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  const alturaVal = form.watch("altura");
  const generoVal = form.watch("genero");
  const isMasculino = generoVal === "Masculino";

  const dynamicTipoFisicoOptions = [
    { name: "Magro(a)", image: isMasculino ? "/magro-masculino.png" : "/magro-feminino.png" },
    { name: "Atlético(a)", image: isMasculino ? "/atletico-masculino.png" : "/atletico-feminino.png" },
    { name: "Curvy", image: isMasculino ? "/curvy-masculino.png" : "/curvy-feminino.png" },
    { name: "Plus Size", image: isMasculino ? "/plus-size-masculino.png" : "/plus-size-feminino.png" },
  ];

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
                options={dynamicTipoFisicoOptions}
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
