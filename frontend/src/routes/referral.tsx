import { createFileRoute } from "@tanstack/react-router";
import { ReferralScreen } from "@/features/referral";
export const Route = createFileRoute("/referral")({ component: ReferralScreen });
