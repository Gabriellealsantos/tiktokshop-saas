import { createFileRoute } from "@tanstack/react-router";
import { PromptsScreen } from "@/features/prompts";
export const Route = createFileRoute("/prompts")({ component: PromptsScreen });
