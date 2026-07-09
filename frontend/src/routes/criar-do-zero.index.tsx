import { createFileRoute } from "@tanstack/react-router";
import { CriarDoZeroScreen } from "@/features/creation/criar-do-zero-screen";

export const Route = createFileRoute("/criar-do-zero/")({
  component: CriarDoZeroScreen,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      productId: search.productId as string | number | undefined,
      avatarId: search.avatarId as string | number | undefined,
      modoAplicacao: search.modoAplicacao as string | undefined,
    };
  },
});
