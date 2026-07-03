import { createFileRoute } from "@tanstack/react-router";
import { EditorScreen } from "@/features/misc/misc-screens";
export const Route = createFileRoute("/editor")({ component: EditorScreen });
