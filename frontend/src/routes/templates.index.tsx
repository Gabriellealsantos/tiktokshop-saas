import { createFileRoute } from "@tanstack/react-router";
import { TemplatesScreen } from "@/features/templates";

export const Route = createFileRoute("/templates/")({ component: TemplatesScreen });
