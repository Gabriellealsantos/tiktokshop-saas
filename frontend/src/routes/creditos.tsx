import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { AppShell } from "@/layouts/app-shell";
import { Page, PageHeader } from "@/components/base/page";
import { Button } from "@/components/base/primitives";
import { useMockSession } from "@/lib/mock-session";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const packages = [
  {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: 29.9,
    description: "Use em imagens, vídeos e avatares",
  },
  {
    id: "essencial",
    name: "Essencial",
    credits: 300,
    price: 79.9,
    bonusPercent: 10,
    description: "Use em imagens, vídeos e avatares",
  },
  {
    id: "pro",
    name: "Pro",
    credits: 600,
    price: 149.9,
    badge: "Mais popular",
    highlighted: true,
    description: "Use em imagens, vídeos e avatares",
  },
  {
    id: "premium",
    name: "Premium",
    credits: 1200,
    price: 279.9,
    bonusPercent: 20,
    description: "Use em imagens, vídeos e avatares",
  },
  {
    id: "business",
    name: "Business",
    credits: 3000,
    price: 649.9,
    bonusPercent: 25,
    description: "Use em imagens, vídeos e avatares",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 6000,
    price: 1199.9,
    badge: "Melhor custo-benefício",
    description: "Use em imagens, vídeos e avatares",
  },
];

export function CreditsScreen() {
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
          {packages.map((pkg) => {
            const pricePerCredit = pkg.price / pkg.credits;
            return (
              <motion.div
                key={pkg.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "relative flex flex-col rounded-[24px] p-[1px] group",
                  pkg.highlighted ? "scale-[1.02] shadow-2xl z-10" : "z-0"
                )}
              >
                {pkg.highlighted && (
                  <div
                    className="absolute inset-0 z-0 overflow-hidden rounded-[24px]"
                    style={{
                      background:
                        "conic-gradient(from var(--border-angle), transparent 0%, transparent 70%, var(--accent-500) 85%, transparent 100%)",
                      animation: "border-spin 4s linear infinite",
                    }}
                  />
                )}
                <div
                  className={cn(
                    "relative z-10 flex h-full flex-col rounded-[23px] p-6 transition-colors border",
                    pkg.highlighted
                      ? "bg-[#09080e] border-white/5 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
                      : "bg-zinc-950/50 border-white/10 group-hover:border-violet-500/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-4 h-6">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      {pkg.name}
                    </span>
                    {(pkg.badge || pkg.bonusPercent) && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          pkg.bonusPercent
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-violet-500/10 text-violet-400"
                        )}
                      >
                        {pkg.bonusPercent ? `+${pkg.bonusPercent}% bônus` : pkg.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="size-6 text-violet-400" />
                    <span className="text-3xl font-extrabold text-white">
                      {new Intl.NumberFormat("pt-BR").format(pkg.credits)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-zinc-400 mb-6">créditos</span>

                  <div className="mt-auto pt-6 border-t border-white/5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">
                        {formatCurrency(pkg.price)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      ≈ {formatCurrency(pricePerCredit)} por crédito
                    </p>

                    <p className="mt-4 text-xs text-zinc-400">{pkg.description}</p>

                    <Button
                      onClick={() => handleBuy(pkg.id)}
                      disabled={loadingId === pkg.id}
                      className={cn(
                        "mt-6 w-full relative overflow-hidden transition-all duration-300",
                        pkg.highlighted
                          ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] border-0"
                          : "bg-transparent border border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/50"
                      )}
                    >
                      {loadingId === pkg.id ? "Processando..." : "Comprar"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-zinc-500">
          <ShieldCheck className="size-4" />
          <span className="text-sm font-medium">Pagamento seguro</span>
        </div>
      </Page>
    </AppShell>
  );
}

export const Route = createFileRoute("/creditos")({
  component: CreditsScreen,
  head: () => ({
    meta: [
      { title: "Comprar Créditos" },
      { name: "description", content: "Recarregue seus créditos e continue criando." },
    ],
  }),
});
