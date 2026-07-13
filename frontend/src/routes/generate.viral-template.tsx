import { createFileRoute } from "@tanstack/react-router";
import { ProductTemplatesPicker } from "@/features/products/template-picker";

export const Route = createFileRoute("/generate/viral-template")({
  component: ProductTemplatesPicker,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      productId: search.productId as string | number | undefined,
    };
  },
});
