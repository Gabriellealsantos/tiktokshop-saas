import { createFileRoute } from "@tanstack/react-router";
import { TrendCharacterList } from "@/features/trends/personagens";

export const Route = createFileRoute("/trend-boost/$template/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { template } = Route.useParams();
  return <TrendCharacterList templateId={template} />;
}
