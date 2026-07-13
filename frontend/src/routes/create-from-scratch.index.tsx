import { createFileRoute } from "@tanstack/react-router";
import { CreateFromScratchScreen } from "@/features/creation";

export const Route = createFileRoute("/create-from-scratch/")({
  component: CreateFromScratchScreen,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      productId: search.productId as string | number | undefined,
      avatarId: search.avatarId as string | number | undefined,
      applicationMode: search.applicationMode as string | undefined,
    };
  },
});
