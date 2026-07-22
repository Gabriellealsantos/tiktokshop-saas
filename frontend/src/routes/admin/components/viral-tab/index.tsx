import { useState } from "react";

import { Pill } from "@/components";
import { TemplatesPanel } from "./components/templates-panel";
import { TonesPanel } from "./components/tones-panel";

type SubTab = "Templates" | "Tons";

/**
 * Aba admin do fluxo viral (Trend Boost): cadastro dinâmico de templates
 * (+ personagens aninhados) e tons, sem redeploy. Consome /api/admin/viral/**.
 */
export function ViralTab() {
  const [sub, setSub] = useState<SubTab>("Templates");

  return (
    <div className="space-y-5 entrance">
      <div className="flex gap-2">
        {(["Templates", "Tons"] as SubTab[]).map((x) => (
          <Pill key={x} active={sub === x} onClick={() => setSub(x)}>
            {x}
          </Pill>
        ))}
      </div>

      {sub === "Templates" ? <TemplatesPanel /> : <TonesPanel />}
    </div>
  );
}