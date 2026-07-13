import { createFileRoute } from "@tanstack/react-router";
import { PoseScreen } from "@/features/creation/pose";

export const Route = createFileRoute("/create-from-scratch/pose")({
  component: PoseScreen,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      productId: search.productId as string | number | undefined,
      avatarId: search.avatarId as string | number | undefined,
      applicationMode: search.applicationMode as string | undefined,
      local: search.local as string | undefined,
      timeOfDay: search.timeOfDay as string | undefined,
      lighting: search.lighting as string | undefined,
      atmosphere: search.atmosphere as string | undefined,
      pose: search.pose as string | undefined,
      manualPose: search.manualPose as string | undefined,
    };
  },
});
