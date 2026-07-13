import { createFileRoute } from "@tanstack/react-router";
import { TrendLanding } from "@/features/trends";
export const Route = createFileRoute("/trend-boost/")({ component: TrendLanding });
