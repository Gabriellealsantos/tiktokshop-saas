import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components";
import type { AvatarFormValues } from "../../index";
import { ImageOptionSelector } from "../image-option-selector";
import { ColorSwatchSelector } from "../color-swatch-selector";
import { corCabeloNaturaisOptions, corCabeloFantasiaOptions } from "../../data";

export function TabCabelo({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  const generoVal = form.watch("genero");
  const isMasculino = generoVal === "Masculino";

  const dynamicEstiloCabeloOptions = [
    { name: "Curto", image: isMasculino ? "/cabelo-curto-masc.png" : "/cabelo-curto-fem.png" },
    { name: "Médio", image: isMasculino ? "/cabelo-medio-masc.png" : "/cabelo-medio-fem.png" },
    { name: "Longo", image: isMasculino ? "/cabelo-longo-masc.png" : "/cabelo-longo-fem.png" },
    { name: "Careca", image: isMasculino ? "/cabelo-careca-masc.png" : "/cabelo-careca-fem.png" },
    { name: "Afro", image: isMasculino ? "/cabelo-afro-masc.png" : "/cabelo-afro-fem.png" },
    { name: "Cacheado", image: isMasculino ? "/cabelo-cacheado-masc.png" : "/cabelo-cacheado-fem.png" }
  ];

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
                options={dynamicEstiloCabeloOptions}
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
              <div className="space-y-5">
                <div className="space-y-1">
                  <div className="text-text-3 text-[10px] font-bold uppercase tracking-widest ml-1">Naturais</div>
                  <ColorSwatchSelector
                    options={corCabeloNaturaisOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-text-3 text-[10px] font-bold uppercase tracking-widest ml-1">Fantasia</div>
                  <ColorSwatchSelector
                    options={corCabeloFantasiaOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </div>
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
