import { createFileRoute } from "@tanstack/react-router";

import { HomeScreen } from "@/features/home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel Principal" },
      { name: "description", content: "Métricas e tendências do seu estúdio." },
    ],
  }),
  component: HomeScreen,
});
