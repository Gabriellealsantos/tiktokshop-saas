import { createFileRoute } from "@tanstack/react-router";
import { SettingsScreen } from "@/features/misc/misc-screens";
export const Route = createFileRoute("/configuracoes")({ component: SettingsScreen });
