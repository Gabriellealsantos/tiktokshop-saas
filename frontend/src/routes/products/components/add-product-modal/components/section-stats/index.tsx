import type { UseFormReturn } from "react-hook-form";
import { Info } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Input } from "@/components";

interface SectionStatsProps {
  form: UseFormReturn<any>;
}

export function SectionStats({ form }: SectionStatsProps) {
  return (
    <div className="p-5 rounded-2xl border border-white/5 bg-surface-2/30 space-y-4">
      <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
        <Info className="size-4 text-brand-400" />
        3. Estatísticas de Venda
      </h3>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <FormField
          control={form.control}
          name="sales"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Texto de Vendas *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 4.5 mil vendas" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="views"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Visualizações</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ex: 150000" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="revenueEstimate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Receita (R$)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Auto" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="conversionRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Conversão (%)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="commissionRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Comissão (%)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="salesPerDay"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Vendas/dia</FormLabel>
              <FormControl>
                <Input type="number" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="trendLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Label Tendência</FormLabel>
              <FormControl>
                <Input placeholder="Em alta" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="salesHistory7d"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel className="text-xs">Histórico 7 Dias (ex: 10,12,15)</FormLabel>
              <FormControl>
                <Input placeholder="12, 15, 20, 18, 25, 30, 45" className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
