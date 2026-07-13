import { BookOpen, Clipboard, Coins, ShoppingBag } from "lucide-react";
import { Button, MetricCard, Field, TextArea, Page, PageHeader, SectionTitle } from "@/components";
import { AppShell } from "@/layouts/app-shell";

export function ReferralScreen() {
  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Programa de indicação"
          title="Indique e Ganhe"
          description="Compartilhe sua página e receba 50% da comissão."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Indicações" value="48" icon={BookOpen} />
          <MetricCard label="Conversões" value="17" icon={ShoppingBag} />
          <MetricCard label="Comissão" value="R$ 1.284" tone="green" icon={Coins} />
        </div>
        <div className="panel mt-5 p-6">
          <SectionTitle title="Seu link e cupom" />
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              readOnly
              value="https://exemplo.com/r/MARINA50"
              className="h-11 flex-1 rounded-xl border border-border bg-deep px-4 text-sm text-text-2"
            />
            <Button>
              <Clipboard />
              Copiar link
            </Button>
          </div>
          <p className="mt-4 text-sm text-text-2">
            Divisão de comissão:{" "}
            <strong className="text-text-1">50% para você · 50% para a operação</strong>
          </p>
        </div>
        <div className="panel mt-5 p-6">
          <SectionTitle title="Página de divulgação personalizada" />
          <Field label="Título da página" defaultValue="Minha central de criação favorita" />
          <TextArea
            label="Mensagem"
            defaultValue="Crie conteúdo para TikTok Shop com mais estratégia e velocidade."
          />
          <Button variant="secondary" className="mt-4">
            Salvar página
          </Button>
        </div>
      </Page>
    </AppShell>
  );
}
