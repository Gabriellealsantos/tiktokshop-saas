import { Coins } from "lucide-react";
import { Button, Pill, Field, Toggle, Page, PageHeader, SectionTitle } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { useMockSession } from "@/context/mock-session";

export default function SettingsScreen() {
  const { credits, setCredits, notificationsEnabled, setNotificationsEnabled } = useMockSession();
  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Conta"
          title="Créditos, Limites e Configurações"
          description="Controle seu perfil e preferências locais."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="panel p-6">
            <SectionTitle
              title="Créditos"
              action={
                <Pill>
                  <Coins className="size-3" />
                  {credits}
                </Pill>
              }
            />
            <p className="text-sm text-text-2">
              Use créditos em ferramentas premium e gerações adicionais.
            </p>
            <Button className="mt-5" onClick={() => setCredits(credits + 100)}>
              Comprar 100 créditos
            </Button>
          </div>
          <div className="panel p-6">
            <SectionTitle title="Limite mensal" />
            <div className="flex justify-between text-sm">
              <span className="text-text-2">Gerações grátis</span>
              <b>2 de 3</b>
            </div>
            <div className="mt-3 h-2 rounded-full bg-surface-3">
              <div className="brand-gradient h-full w-2/3 rounded-full" />
            </div>
          </div>
          <div className="panel p-6">
            <SectionTitle title="Perfil" />
            <div className="space-y-4">
              <Field label="Nome" defaultValue="Marina Rocha" />
              <Field label="E-mail" defaultValue="marina@exemplo.com" />
              <Button variant="secondary">Salvar alterações</Button>
            </div>
          </div>
          <div className="panel p-6">
            <SectionTitle title="Preferências" />
            <div className="space-y-5">
              <div className="flex justify-between">
                <span className="text-sm">Notificações</span>
                <Toggle checked={notificationsEnabled} onChange={setNotificationsEnabled} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tema escuro</span>
                <Toggle checked onChange={() => {}} />
              </div>
            </div>
          </div>
        </div>
      </Page>
    </AppShell>
  );
}
