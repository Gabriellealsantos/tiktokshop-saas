import { createFileRoute } from "@tanstack/react-router";
import { PoseScreen } from "@/features/creation/pose-screen";

export const Route = createFileRoute("/criar-do-zero/pose")({
  component: PoseScreen,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      productId: search.productId as string | number | undefined,
      avatarId: search.avatarId as string | number | undefined,
      modoAplicacao: search.modoAplicacao as string | undefined,
      local: search.local as string | undefined,
      horario: search.horario as string | undefined,
      iluminacao: search.iluminacao as string | undefined,
      atmosfera: search.atmosfera as string | undefined,
      pose: search.pose as string | undefined,
      poseManual: search.poseManual as string | undefined,
    };
  },
});
