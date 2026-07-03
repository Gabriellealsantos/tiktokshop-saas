import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/features/auth/auth-screen";
export const Route = createFileRoute("/cadastro")({
  component: () => <AuthScreen mode="register" />,
  head: () => ({
    meta: [
      { title: "Cadastro — Estúdio Criativo" },
      { name: "description", content: "Crie sua conta de creator." },
    ],
  }),
});
