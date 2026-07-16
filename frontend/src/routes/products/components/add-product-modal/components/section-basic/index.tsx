import type { UseFormReturn } from "react-hook-form";
import { LayoutDashboard } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components";
import { categories } from "@/data/mock";

interface SectionBasicProps {
  form: UseFormReturn<any>;
}

export function SectionBasic({ form }: SectionBasicProps) {
  return (
    <div className="p-5 rounded-2xl border border-white/5 bg-surface-2/30 space-y-4">
      <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
        <LayoutDashboard className="size-4 text-brand-400" />
        2. Informações Básicas
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel className="text-xs">Nome do Produto *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Ring Light Profissional" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Tipo *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-10 text-sm bg-surface-1 border-white/10">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Preço (R$) *</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
