import { createFileRoute } from "@tanstack/react-router";
import { TrendWizard } from "@/features/trends/trend-boost";
export const Route = createFileRoute("/trend-boost/$template")({ component: Page });
function Page() {
  const { template } = Route.useParams();
  return <TrendWizard template={template} />;
}
