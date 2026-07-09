import { createFileRoute } from "@tanstack/react-router";
import { CenarioScreen } from "@/features/creation/cenario-screen";

export const Route = createFileRoute("/criar-do-zero/cenario")({
  component: CenarioScreen,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      productId: search.productId as string | number | undefined,
      avatarId: search.avatarId as string | number | undefined,
      modoAplicacao: search.modoAplicacao as string | undefined,
    };
  },
});
