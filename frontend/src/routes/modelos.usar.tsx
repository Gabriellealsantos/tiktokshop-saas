import { createFileRoute } from "@tanstack/react-router";
import { ModelAssemblyScreen } from "@/features/modelos/model-assembly-screen";

export const Route = createFileRoute("/modelos/usar")({
  component: ModelAssemblyScreen,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: search.id as string | number | undefined,
      video: search.video as string | undefined,
      productId: search.productId as string | number | undefined,
    };
  },
});
