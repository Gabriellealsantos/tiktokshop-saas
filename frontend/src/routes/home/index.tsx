import { useState } from "react";
import { motion } from "motion/react";
import { AppShell } from "@/layouts/app-shell";
import { Page } from "@/components";
import { cn } from "@/utils/utils";
import { useDocumentTitle } from "@/utils/use-document-title";
import { useAuth } from "@/context/auth";

import { DashboardContent } from "@/routes/dashboard";
import { LaunchpadContent } from "./components/launchpad-content";

export default function IndexRoute() {
  useDocumentTitle("Painel Principal");
  const { isAdmin, roles } = useAuth();
  const isAfiliado = roles?.includes("ROLE_AFFILIATE") ?? false;
  const canSeeDashboard = isAdmin || isAfiliado;

  const [view, setView] = useState<"dashboard" | "central">(canSeeDashboard ? "dashboard" : "central");

  const headerToggle = canSeeDashboard ? (
    <div className="flex w-fit items-center rounded-full border border-white/10 bg-black/40 p-1 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] entrance">
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
            className="absolute inset-0 rounded-full btn-brand"
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
            className="absolute inset-0 rounded-full btn-brand"
            transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
          />
        )}
        <span className="relative z-10">Central</span>
      </button>
    </div>
  ) : null;

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
