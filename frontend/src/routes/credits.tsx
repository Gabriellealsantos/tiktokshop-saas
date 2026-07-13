import { createFileRoute } from "@tanstack/react-router";

import { CreditsScreen } from "@/features/credits";

export const Route = createFileRoute("/credits")({
  component: CreditsScreen,
  head: () => ({
    meta: [
      { title: "Comprar Créditos" },
      { name: "description", content: "Recarregue seus créditos e continue criando." },
    ],
  }),
});
