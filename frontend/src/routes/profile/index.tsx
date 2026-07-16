import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { KeyRound, LogOut, ShieldCheck, UserCircle } from "lucide-react";
import axios from "axios";

import { AppShell } from "@/layouts/app-shell";
import { Page, PageHeader, SectionTitle, Button, Field, Toggle } from "@/components";
import { useAuth } from "@/context/auth";
import { mapUserResponse, type UserStatus, type UserPlan } from "@/models/user";
import { updateMe, changeMyPassword } from "@/services/userService";
import { cn } from "@/utils/utils";
import { useDocumentTitle } from "@/utils/use-document-title";
import { profileSchema, passwordSchema, type ProfileForm, type PasswordForm } from "./schema";

export default function ProfileScreen() {
  useDocumentTitle("Meu Perfil");
  const { user: authUser, logout, reloadUser } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const user = authUser ? mapUserResponse(authUser) : null;

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  // Sincroniza o form quando o usuário do contexto carrega/atualiza.
  useEffect(() => {
    if (user) profileForm.reset({ name: user.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const onProfileSubmit = async (data: ProfileForm) => {
    setIsUpdatingProfile(true);
    try {
      await updateMe({ name: data.name });
      await reloadUser();
      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Falha ao atualizar o perfil.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setIsUpdatingPassword(true);
    try {
      await changeMyPassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      passwordForm.reset();
      toast.success("Senha alterada com sucesso!");
    } catch (e) {
      const msg = axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message : undefined;
      toast.error(msg ?? "Falha ao alterar a senha. Verifique a senha atual.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <AppShell>
        <Page className="max-w-[1000px]">
          <div className="py-16 text-center text-sm text-zinc-500">Carregando perfil…</div>
        </Page>
      </AppShell>
    );
  }

  const initial = user.name.charAt(0).toUpperCase();
  const joinedDate = format(new Date(user.createdAt), "MMMM 'de' yyyy", { locale: ptBR });
  const planExpires = user.planExpiresAt
    ? format(new Date(user.planExpiresAt), "dd/MM/yyyy", { locale: ptBR })
    : null;

  const statusColors: Record<UserStatus, string> = {
    aprovado: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pendente: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    bloqueado: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const planLabels: Record<UserPlan, string> = {
    sem_plano: "Sem Plano",
    mensal: "Plano Mensal",
    trimestral: "Plano Trimestral",
    semestral: "Plano Semestral",
    anual: "Plano Anual",
    vitalicio: "Plano Vitalício",
  };

  return (
    <AppShell>
      <Page className="max-w-[1000px]">
        <PageHeader
          eyebrow="CONFIGURAÇÕES"
          title="Meu Perfil"
          description="Gerencie suas informações, segurança e preferências."
        />

        <div className="grid gap-6">
          {/* Header Card */}
          <div className="panel p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 opacity-20 pointer-events-none">
              <div className="w-64 h-64 brand-gradient rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 flex size-24 shrink-0 items-center justify-center rounded-full brand-gradient text-3xl font-bold text-white shadow-xl ring-4 ring-zinc-950">
              {initial}
            </div>

            <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-sm text-zinc-400 mt-1">{user.email}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", statusColors[user.status])}>
                  {user.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  {user.role}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-zinc-300 border border-white/10">
                  {planLabels[user.plan]}
                </span>
              </div>

              <p className="text-xs text-zinc-500 mt-4">
                Membro desde <span className="capitalize">{joinedDate}</span>
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Dados da conta */}
            <div className="panel p-6">
              <SectionTitle title="Dados da conta" icon={<UserCircle className="size-4 text-zinc-400" />} />

              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 mt-4">
                <div>
                  <Field
                    label="Nome completo"
                    {...profileForm.register("name")}
                    aria-invalid={!!profileForm.formState.errors.name}
                    aria-describedby="name-error"
                  />
                  {profileForm.formState.errors.name && (
                    <p id="name-error" className="mt-1 text-xs text-red-400">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Field
                    label="E-mail"
                    value={user.email}
                    readOnly
                    disabled
                    className="opacity-70 cursor-not-allowed"
                    hint="O e-mail não pode ser alterado por aqui."
                  />
                </div>

                <Button type="submit" variant="secondary" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? "Salvando..." : "Salvar alterações"}
                </Button>
              </form>
            </div>

            {/* Plano e Assinatura */}
            <div className="panel p-6 flex flex-col">
              <SectionTitle title="Plano e Assinatura" icon={<ShieldCheck className="size-4 text-zinc-400" />} />

              <div className="mt-4 flex-1">
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div>
                    <p className="text-sm font-medium text-white">{planLabels[user.plan]}</p>
                    {user.plan !== "sem_plano" && user.plan !== "vitalicio" && planExpires && (
                      <p className="text-xs text-zinc-400 mt-1">Renova em {planExpires}</p>
                    )}
                  </div>
                  <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                    user.status === "aprovado" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400")}>
                    {user.status === "aprovado" ? "Ativo" : user.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Preferências */}
            <div className="panel p-6">
              <SectionTitle title="Preferências" />

              <div className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Tema escuro</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Ativar modo noturno na interface</p>
                  </div>
                  <Toggle checked={isDark} onChange={setIsDark} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Notificações</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Receber alertas de vendas e geração</p>
                  </div>
                  <Toggle checked={notificationsEnabled} onChange={setNotificationsEnabled} />
                </div>
              </div>
            </div>

            {/* Segurança */}
            <div className="panel p-6 md:col-span-2">
              <SectionTitle title="Segurança" icon={<KeyRound className="size-4 text-zinc-400" />} />

              <div className="grid gap-8 md:grid-cols-2 mt-4">
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <h3 className="text-sm font-medium text-white mb-4">Alterar senha</h3>

                  <div>
                    <Field
                      type="password"
                      label="Senha atual"
                      {...passwordForm.register("currentPassword")}
                      aria-invalid={!!passwordForm.formState.errors.currentPassword}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="mt-1 text-xs text-red-400">{passwordForm.formState.errors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Field
                        type="password"
                        label="Nova senha"
                        {...passwordForm.register("newPassword")}
                        aria-invalid={!!passwordForm.formState.errors.newPassword}
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="mt-1 text-xs text-red-400">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>
                    <div>
                      <Field
                        type="password"
                        label="Confirmar nova senha"
                        {...passwordForm.register("confirmPassword")}
                        aria-invalid={!!passwordForm.formState.errors.confirmPassword}
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-400">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" variant="secondary" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? "Alterando..." : "Atualizar senha"}
                  </Button>
                </form>

                <div className="flex flex-col justify-between border-t border-white/5 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">Encerrar sessão</h3>
                    <p className="text-xs text-zinc-400">
                      Desconecta sua conta deste dispositivo. Você precisará fazer login novamente para acessar.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="mt-6 w-full sm:w-auto text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4 mr-2" />
                    Sair da conta
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Page>
    </AppShell>
  );
}
