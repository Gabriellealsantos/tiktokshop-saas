import type { UseFormReturn } from "react-hook-form";
import { Plus } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from "@/components";

interface SectionOriginProps {
  form: UseFormReturn<any>;
}

export function SectionOrigin({ form }: SectionOriginProps) {
  return (
    <div className="p-5 rounded-2xl border border-white/5 bg-surface-2/30 space-y-4">
      <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
        <Plus className="size-4 text-brand-400" />
        4. Origem & Destaques
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="miningWindow"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Janela de Mineração</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-10 text-sm bg-surface-1 border-white/10">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="00:00–06:00">00:00–06:00</SelectItem>
                  <SelectItem value="06:00–12:00">06:00–12:00</SelectItem>
                  <SelectItem value="12:00–18:00">12:00–18:00</SelectItem>
                  <SelectItem value="18:00–00:00">18:00–00:00</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-3">
          <FormField
            control={form.control}
            name="viral"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 bg-surface-1 px-3 py-2">
                <div className="space-y-0.5">
                  <FormLabel className="text-xs">Produto Viral (🔥)</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="favorite"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 bg-surface-1 px-3 py-2">
                <div className="space-y-0.5">
                  <FormLabel className="text-xs">Favorito Inicial</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
