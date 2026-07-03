import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";

import { DashboardContent } from "@/features/dashboard/dashboard";
import { LaunchpadContent } from "@/features/launchpad/launchpad";
import { AppShell } from "@/layouts/app-shell";
import { Page } from "@/components/base/page";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel Principal" },
      { name: "description", content: "Métricas e tendências do seu estúdio." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [view, setView] = useState<"dashboard" | "central">("dashboard");

  const headerToggle = (
    <div className="-mt-4 mb-2 flex justify-center entrance">
      <div className="flex w-fit items-center rounded-full border border-white/10 bg-black/40 p-1 shadow-inner">
        <button
          onClick={() => setView("dashboard")}
          className={cn(
            "relative rounded-full px-5 py-1.5 text-xs font-bold transition-colors",
            view === "dashboard" ? "text-white" : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          {view === "dashboard" && (
            <motion.div
              layoutId="home-view-toggle"
              className="absolute inset-0 rounded-full bg-violet-600 shadow-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
            />
          )}
          <span className="relative z-10">Dashboard</span>
        </button>
        <button
          onClick={() => setView("central")}
          className={cn(
            "relative rounded-full px-5 py-1.5 text-xs font-bold transition-colors",
            view === "central" ? "text-white" : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          {view === "central" && (
            <motion.div
              layoutId="home-view-toggle"
              className="absolute inset-0 rounded-full bg-violet-600 shadow-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
            />
          )}
          <span className="relative z-10">Central</span>
        </button>
      </div>
    </div>
  );

  return (
    <AppShell>
      <Page>
        {view === "dashboard" ? (
          <DashboardContent renderHeader={headerToggle} />
        ) : (
          <LaunchpadContent renderHeader={headerToggle} />
        )}
      </Page>
    </AppShell>
  );
}
