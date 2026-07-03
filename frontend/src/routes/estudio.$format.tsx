import { createFileRoute } from "@tanstack/react-router";
import { CreationWizard } from "@/features/creation/creation-studio";
export const Route = createFileRoute("/estudio/$format")({ component: StudioRoute });
function StudioRoute() {
  const { format } = Route.useParams();
  return <CreationWizard format={format} />;
}
