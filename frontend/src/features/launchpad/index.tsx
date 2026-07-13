import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Boxes, Image, Search, Sparkles, TrendingUp, WandSparkles } from "lucide-react";
import { Button, Pill, SelectableCard, Page, PageHeader, SectionTitle } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { products } from "@/services/data";

export function LaunchpadContent({ renderHeader }: { renderHeader?: ReactNode }) {
  const modules = [
    ["Mineração de Produtos", "Descubra oportunidades antes da saturação.", Boxes, "/products"],
    [
      "Gerador de Avatar",
      "Crie creators consistentes para seus vídeos.",
      WandSparkles,
      "/avatars",
    ],
  ] as const;
  return (
    <>
      {renderHeader}
      <PageHeader
        eyebrow="Central de criação"
        title="O que você vai criar hoje?"
        description="Transforme sinais de mercado em conteúdo pronto para produzir."
      />
      <div className="entrance glass-surface p-3 md:flex md:items-center">
        <div className="flex flex-1 items-center gap-3 px-3">
          <Search className="size-5 text-text-3" />
          <input
            aria-label="Buscar produto ou ideia"
            className="h-12 w-full bg-transparent text-sm text-text-1 placeholder:text-text-3"
            placeholder="Busque um produto, nicho ou ideia viral..."
          />
        </div>
        <Button size="lg" className="w-full md:w-auto">
          <TrendingUp />
          Minerar
        </Button>
      </div>
      <section className="mt-10">
        <SectionTitle
          title="Atalhos criativos"
          description="Continue do ponto certo para sua próxima peça."
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {modules.map(([title, description, Icon, to], index) => (
            <Link
              to={to}
              key={title}
              style={{ animationDelay: `${index * 60}ms` }}
              className="entrance"
            >
              <SelectableCard title={title} description={description} icon={Icon} />
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-10">
        <div className="glass-surface p-5">
          <SectionTitle
            title="Top Produtos"
            description="Tempo real"
            action={<Pill tone="success">ONLINE</Pill>}
          />
          <div className="space-y-1">
            {products.slice(0, 5).map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5 transition-colors"
              >
                <span className="w-5 text-xs font-bold text-text-3">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <img src={product.image} alt="" className="size-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{product.name}</p>
                  <p className="mt-1 text-[10px] text-text-3">{product.sales}</p>
                </div>
                <TrendingUp className="size-4 text-success" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function Launchpad() {
  return (
    <AppShell>
      <Page>
        <LaunchpadContent />
      </Page>
    </AppShell>
  );
}
