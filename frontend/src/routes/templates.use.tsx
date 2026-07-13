import { createFileRoute } from "@tanstack/react-router";
import { TemplateAssemblyScreen } from "@/features/templates/assembly";

export const Route = createFileRoute("/templates/use")({
  component: TemplateAssemblyScreen,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: search.id as string | number | undefined,
      video: search.video as string | undefined,
      productId: search.productId as string | number | undefined,
    };
  },
});
