import { createFileRoute } from "@tanstack/react-router";
import { ToolsScreen } from "@/features/tools";
export const Route = createFileRoute("/tools")({ component: ToolsScreen });
