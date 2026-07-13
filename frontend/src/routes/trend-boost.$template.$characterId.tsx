import { createFileRoute } from "@tanstack/react-router";
import { TrendCharacterFlow } from "@/features/trends/personagem";

export const Route = createFileRoute("/trend-boost/$template/$characterId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { template, characterId } = Route.useParams();
  return <TrendCharacterFlow templateId={template} characterId={characterId} />;
}
