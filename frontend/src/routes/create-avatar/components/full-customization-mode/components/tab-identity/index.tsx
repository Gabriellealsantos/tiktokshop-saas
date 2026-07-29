import type { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Slider,
} from "@/components";
import type { AvatarFormValues } from "../../avatar-schema";
import { ImageOptionSelector } from "../image-option-selector";
import { generoOptions, etniaOptions, tomPeleOptions } from "../../data";

export function TabIdentidade({
  form,
}: {
  form: UseFormReturn<AvatarFormValues>;
}) {
  const idadeVal = form.watch("idade");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider">
              Nome do Avatar
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Aurora, Marcus, Luna..."
                className="glass-container text-white h-12 rounded-xl focus-visible:ring-brand-500 focus-visible:border-brand-500 transition-all"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="genero"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">
              Gênero
            </FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={generoOptions}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="idade"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider flex justify-between">
              <span>Idade</span>
              <span className="text-brand-300">{idadeVal} ANOS</span>
            </FormLabel>
            <FormControl>
              <Slider
                min={18}
                max={65}
                step={1}
                value={[field.value]}
                onValueChange={(val) => field.onChange(val[0])}
                className="py-2"
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="etnia"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">
              Etnia / Origem
            </FormLabel>
            <FormControl>
              <ImageOptionSelector
                columns={4}
                options={etniaOptions}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tomPele"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-text-2 text-xs font-bold uppercase tracking-wider mb-2 block">
              Tom de Pele
            </FormLabel>
            <FormControl>
              <ImageOptionSelector
                options={tomPeleOptions}
                value={field.value}
                onChange={field.onChange}
                columns={3}
                aspectRatio="aspect-[16/7]"
                objectFit="object-cover"
                hideLabel
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
