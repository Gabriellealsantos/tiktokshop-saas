import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/dashboard";
export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Painel Principal" },
      { name: "description", content: "Métricas e tendências do seu estúdio." },
    ],
  }),
});
