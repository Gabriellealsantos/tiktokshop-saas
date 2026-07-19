import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components";
import type { AvatarFormValues } from "../../index";
import { ImageOptionSelector } from "../image-option-selector";
import { estiloCabeloOptions, corCabeloOptions } from "../../data";

export function TabCabelo({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  const generoVal = form.watch("genero");
  const isFeminino = generoVal === "Feminino" || !generoVal;

  const dynamicCorCabeloOptions = corCabeloOptions.map((opt) => ({
    ...opt,
    image: isFeminino ? opt.image : opt.image?.replace(".png", "-masc.png")
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="estiloCabelo"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Estilo de Cabelo</FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={estiloCabeloOptions}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="corCabelo"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">Cor do Cabelo</FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={dynamicCorCabeloOptions}
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
