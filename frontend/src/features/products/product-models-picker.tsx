import { useSearch } from "@tanstack/react-router";
import { SharedModelsView } from "@/features/modelos/modelos-screen";

export function ProductModelsPicker() {
  const search: any = useSearch({ strict: false });
  const productId = search.productId;

  return <SharedModelsView isPicker productId={productId} />;
}
