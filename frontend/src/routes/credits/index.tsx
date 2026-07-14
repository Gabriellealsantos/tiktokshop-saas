import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/layouts/app-shell";
import { Page, PageHeader } from "@/components";
import { useMockSession } from "@/context/mock-session";
import { useDocumentTitle } from "@/utils/use-document-title";
import { packages } from "./data";
import { CreditPackageCard } from "./components/credit-package-card";

export default function CreditsScreen() {
  useDocumentTitle("Comprar Créditos");
  const { credits } = useMockSession();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleBuy = (id: string) => {
    setLoadingId(id);
    // Simulate a network request
    setTimeout(() => {
      setLoadingId(null);
      // TODO: integrate checkout
      toast("Em breve: finalização de compra", {
        description: `Pacote selecionado: ${id}`,
      });
    }, 800);
  };

  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="CRÉDITOS"
          title="Recarregue seus créditos"
          description="Escolha o pacote ideal e continue criando sem limites."
          actions={
            <div className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-zinc-300">
              Seu saldo atual: <span className="font-bold text-white">{credits}</span> créditos
            </div>
          }
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <CreditPackageCard
              key={pkg.id}
              pkg={pkg}
              loading={loadingId === pkg.id}
              onBuy={handleBuy}
            />
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-zinc-500">
          <ShieldCheck className="size-4" />
          <span className="text-sm font-medium">Pagamento seguro</span>
        </div>
      </Page>
    </AppShell>
  );
}
