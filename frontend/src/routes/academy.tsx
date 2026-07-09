import { createFileRoute } from "@tanstack/react-router";
import { AcademyScreen } from "@/features/misc/misc-screens";
export const Route = createFileRoute("/academy")({ component: AcademyScreen });
