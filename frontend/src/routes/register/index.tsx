import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/features/auth";
export const Route = createFileRoute("/register")({
  component: () => <AuthScreen mode="register" />,
  head: () => ({
    meta: [
      { title: "Cadastro — Estúdio Criativo" },
      { name: "description", content: "Crie sua conta de creator." },
    ],
  }),
});
