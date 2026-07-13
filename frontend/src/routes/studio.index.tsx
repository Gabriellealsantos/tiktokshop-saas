import { createFileRoute } from "@tanstack/react-router";
import { StudioLanding } from "@/features/creation/studio";
export const Route = createFileRoute("/studio/")({ component: StudioLanding });
