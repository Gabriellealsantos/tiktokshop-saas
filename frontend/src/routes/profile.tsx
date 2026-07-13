import { createFileRoute } from "@tanstack/react-router";

import { ProfileScreen } from "@/features/profile";

export const Route = createFileRoute("/profile")({
  component: ProfileScreen,
  head: () => ({
    meta: [
      { title: "Meu Perfil" },
      { name: "description", content: "Gerencie suas configurações e conta." },
    ],
  }),
});
