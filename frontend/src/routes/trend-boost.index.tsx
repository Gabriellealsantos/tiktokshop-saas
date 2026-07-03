import { createFileRoute } from "@tanstack/react-router";
import { TrendLanding } from "@/features/trends/trend-boost";
export const Route = createFileRoute("/trend-boost/")({ component: TrendLanding });
