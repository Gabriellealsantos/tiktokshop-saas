import { createFileRoute } from "@tanstack/react-router";
import { EditorScreen } from "@/features/editor";
export const Route = createFileRoute("/editor")({ component: EditorScreen });
