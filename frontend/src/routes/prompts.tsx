import { createFileRoute } from "@tanstack/react-router";
import { PromptsScreen } from "@/features/misc/misc-screens";
export const Route = createFileRoute("/prompts")({ component: PromptsScreen });
