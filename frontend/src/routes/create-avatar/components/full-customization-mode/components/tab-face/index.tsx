import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components";
import type { AvatarFormValues } from "../../avatar-schema";
import { ImageOptionSelector } from "../image-option-selector";

import {
  corOlhosOptions,
  expressaoOptions,
  pelosFaciaisOptions,
  bocaOptions,
  sobrancelhaOptions,
  narizOptions,
} from "../../data";
export function TabRosto({ form }: { form: UseFormReturn<AvatarFormValues> }) {
  const formatoRostoOptions = [
    { name: "Oval", image: "/oval.jpeg" },
    { name: "Redondo", image: "/redondo.jpeg" },
    { name: "Quadrado", image: "/quadrado.jpeg" },
    { name: "Coração", image: "/coracao.jpeg" },
    { name: "Alongado", image: "/alongado.jpeg" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="formatoRosto"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">
              Formato do Rosto
            </FormLabel>
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
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">
              Cor dos Olhos
            </FormLabel>
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
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">
              Expressão
            </FormLabel>
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
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">
              Pelos Faciais
            </FormLabel>
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
      <FormField
        control={form.control}
        name="boca"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">
              Boca
            </FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={bocaOptions}
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
        name="sobrancelha"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">
              Sobrancelha
            </FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={sobrancelhaOptions}
                value={field.value}
                onChange={field.onChange}
                columns={3}
                aspectRatio="aspect-[16/7]"
                objectFit="object-contain"
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nariz"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">
              Nariz
            </FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={narizOptions}
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
