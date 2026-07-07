import { createFileRoute } from "@tanstack/react-router";
import { ProductModelsPicker } from "@/features/products/product-models-picker";

export const Route = createFileRoute("/gerar/modelo-viral")({
  component: ProductModelsPicker,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      productId: search.productId as string | number | undefined,
    };
  },
});
