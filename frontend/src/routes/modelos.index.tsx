import { createFileRoute } from "@tanstack/react-router";
import { ModelosScreen } from "@/features/modelos/modelos-screen";

export const Route = createFileRoute("/modelos/")({ component: ModelosScreen });
