import { useSearchParams } from "react-router-dom";
import { SharedModelsView } from "@/components";

export default function ProductTemplatesPicker() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId") ?? undefined;

  return <SharedModelsView isPicker productId={productId} />;
}
