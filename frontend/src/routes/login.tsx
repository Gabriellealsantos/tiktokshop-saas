import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/features/auth/auth-screen";
export const Route = createFileRoute("/login")({
  component: () => <AuthScreen mode="login" />,
  head: () => ({
    meta: [
      { title: "Entrar — Estúdio Criativo" },
      { name: "description", content: "Acesse seu estúdio de criação." },
    ],
  }),
});
