import { AppShell } from "@/layouts/app-shell";
import { Page, PageHeader } from "@/components";
import { useAuth } from "@/context/auth";
import { mapUserResponse } from "@/models/user";
import { useDocumentTitle } from "@/utils/use-document-title";

import { AccountHeader, SubscriptionCard } from "./components/account-info";
import { ProfileForm } from "./components/profile-form";
import { PasswordForm } from "./components/password-form";

export default function ProfileScreen() {
  useDocumentTitle("Meu Perfil");
  const { user: authUser, logout } = useAuth();

  const user = authUser ? mapUserResponse(authUser) : null;

  if (!user) {
    return (
      <AppShell>
        <Page className="max-w-[1000px]">
          <div className="py-16 text-center text-sm text-zinc-500">Carregando perfil…</div>
        </Page>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Page className="max-w-[1000px]">
        <PageHeader
          eyebrow="CONFIGURAÇÕES"
          title="Meu Perfil"
          description="Gerencie suas informações, segurança e preferências."
        />

        <div className="grid gap-6">
          <AccountHeader
            name={user.name}
            email={user.email}
            status={user.status}
            role={user.role}
            plan={user.plan}
            createdAt={user.createdAt}
            planExpiresAt={user.planExpiresAt}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <ProfileForm userName={user.name} userEmail={user.email} />
            <SubscriptionCard plan={user.plan} status={user.status} planExpiresAt={user.planExpiresAt} />
            <PasswordForm onLogout={logout} />
          </div>
        </div>
      </Page>
    </AppShell>
  );
}
