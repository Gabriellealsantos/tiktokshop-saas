import { useSearchParams } from "react-router-dom";
import { SharedModelsView } from "@/components";

export default function ProductTemplatesPicker() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId") ?? undefined;
  // Produto próprio do usuário: espaço de id separado do catálogo, parâmetro separado.
  const userProductId = searchParams.get("userProductId") ?? undefined;

  return (
    <SharedModelsView
      isPicker
      productId={productId}
      userProductId={userProductId}
    />
  );
}
