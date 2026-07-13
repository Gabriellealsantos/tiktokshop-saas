import { createFileRoute } from "@tanstack/react-router";
import { ScenarioScreen } from "@/features/creation/scenario";

export const Route = createFileRoute("/create-from-scratch/scenario")({
  component: ScenarioScreen,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      productId: search.productId as string | number | undefined,
      avatarId: search.avatarId as string | number | undefined,
      applicationMode: search.applicationMode as string | undefined,
    };
  },
});
