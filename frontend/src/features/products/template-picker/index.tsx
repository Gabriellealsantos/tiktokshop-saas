import { useSearch } from "@tanstack/react-router";
import { SharedModelsView } from "@/features/templates";

export function ProductTemplatesPicker() {
  const search = useSearch({ strict: false }) as Record<string, string | undefined>;
  const productId = search.productId;

  return <SharedModelsView isPicker productId={productId} />;
}
