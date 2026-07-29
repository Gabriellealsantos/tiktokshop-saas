import type { UseFormReturn } from "react-hook-form";
import { Link as LinkIcon } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Input } from "@/components";
import type { AddProductFormValues } from "../..";

interface SectionAffiliateProps {
  form: UseFormReturn<AddProductFormValues>;
}

export function SectionAffiliate({ form }: SectionAffiliateProps) {
  return (
    <div className="p-5 rounded-2xl border border-white/5 bg-surface-2/30 space-y-4">
      <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
        <LinkIcon className="size-4 text-brand-400" />
        5. Afiliação TikTok Shop
      </h3>
      <FormField
        control={form.control}
        name="affiliateUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Link do Produto *</FormLabel>
            <FormControl>
              <Input placeholder="https://shop.tiktok.com/..." className="h-10 text-sm bg-surface-1 border-white/10" {...field} />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  );
}
