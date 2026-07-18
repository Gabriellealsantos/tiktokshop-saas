import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components";
import type { AvatarFormValues } from "../../index";
import { ImageOptionSelector } from "../image-option-selector";

import { corOlhosOptions, expressaoOptions, pelosFaciaisOptions } from "../../data";

export function TabRosto({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  const generoVal = form.watch("genero");
  const isMasculino = generoVal === "Masculino";

  const dynamicFormatoRostoOptions = [
    { name: "Oval", image: isMasculino ? "/oval-masc.png" : "/oval-fem.png" },
    { name: "Redondo", image: isMasculino ? "/redondo-masc.png" : "/redondo-fem.png" },
    { name: "Quadrado", image: isMasculino ? "/quadrado-masc.png" : "/quadrado-fem.png" },
    { name: "Coração", image: isMasculino ? "/coracao-masc.png" : "/coracao-fem.png" },
    { name: "Alongado", image: isMasculino ? "/alongado-masc.png" : "/alongado-fem.png" }
  ];

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
                options={dynamicFormatoRostoOptions}
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
              <ImageOptionSelector
                options={corOlhosOptions}
                value={field.value}
                onChange={field.onChange}
                columns={3}
                aspectRatio="aspect-[3/2]"
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
              <ImageOptionSelector
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
