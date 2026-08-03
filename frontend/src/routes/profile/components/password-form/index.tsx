import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KeyRound, LogOut, ShieldAlert, Lock, Sparkles } from "lucide-react";
import axios from "axios";

import { SectionTitle, Button, Field } from "@/components";
import { changeMyPassword } from "@/services/userService";
import { passwordSchema, type PasswordForm as PasswordFormType } from "../../schema";

interface PasswordFormProps {
  onLogout: () => void;
}

export function PasswordForm({ onLogout }: PasswordFormProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<PasswordFormType>({
    resolver: zodResolver(passwordSchema),
    mode: "onTouched",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: PasswordFormType) => {
    setIsUpdating(true);
    try {
      await changeMyPassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      form.reset();
      toast.success("Senha alterada com sucesso!");
    } catch (e) {
      const msg = axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message : undefined;
      toast.error(msg ?? "Falha ao alterar a senha. Verifique a senha atual.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="rounded-[28px] bg-white/[0.02] backdrop-blur-[6px] border border-white/15 ring-1 ring-inset ring-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 sm:p-8">
      <SectionTitle title="Segurança & Acesso" icon={<KeyRound className="size-5 text-brand-400" />} />
      <p className="text-xs sm:text-sm text-white/90 font-medium mt-1 pb-6 border-b border-white/10">
        Gerencie a senha de acesso à sua conta e controle suas sessões ativas com máxima segurança e criptografia avançada.
      </p>

      <div className="grid gap-8 lg:grid-cols-12 mt-6 items-stretch">
        {/* Lado Esquerdo - Formulário de Alteração de Senha em Card Glass Premium */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:col-span-7 xl:col-span-8 p-6 sm:p-8 rounded-[24px] bg-[linear-gradient(135deg,rgba(75,68,232,0.12)_0%,rgba(75,68,232,0.02)_50%,rgba(75,68,232,0.05)_100%)] border border-brand-500/35 shadow-[0_12px_40px_-12px_rgba(75,68,232,0.3),inset_0_1px_1px_rgba(255,255,255,0.18)] flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-brand-400/50"
        >
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-brand-500/20 blur-[80px] rounded-full pointer-events-none -z-10" />

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-[linear-gradient(135deg,rgba(75,68,232,0.35)_0%,rgba(75,68,232,0.10)_100%)] border border-brand-400/50 shadow-[0_0_20px_-4px_rgba(75,68,232,0.6)] flex items-center justify-center text-brand-300 shrink-0">
                  <Lock className="size-5 drop-shadow-[0_0_10px_rgba(150,140,255,0.8)]" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">Alterar senha de acesso</h3>
                  <p className="text-xs text-brand-300 font-bold mt-0.5">Proteção e criptografia da sua conta</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-[linear-gradient(135deg,rgba(75,68,232,0.25)_0%,rgba(75,68,232,0.10)_100%)] text-brand-300 px-3 py-1 rounded-full border border-brand-500/40 shadow-xs">
                <Sparkles className="size-3 text-brand-400 animate-pulse" />
                Recomendado periodicamente
              </span>
            </div>

            <div className="space-y-5 pt-1">
              <div>
                <Field
                  type="password"
                  label="Senha atual"
                  {...form.register("currentPassword")}
                  aria-invalid={!!form.formState.errors.currentPassword}
                />
                {form.formState.errors.currentPassword && (
                  <p className="mt-1.5 text-xs text-red-400 font-bold flex items-center gap-1">
                    {form.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Field
                    type="password"
                    label="Nova senha"
                    {...form.register("newPassword")}
                    aria-invalid={!!form.formState.errors.newPassword}
                  />
                  {form.formState.errors.newPassword && (
                    <p className="mt-1.5 text-xs text-red-400 font-bold flex items-center gap-1">
                      {form.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div>
                  <Field
                    type="password"
                    label="Confirmar nova senha"
                    {...form.register("confirmPassword")}
                    aria-invalid={!!form.formState.errors.confirmPassword}
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-400 font-bold flex items-center gap-1">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 mt-8 flex justify-end">
            <Button
              type="submit"
              className="btn-brand gradient-brand px-8 h-12 rounded-xl font-bold text-white shadow-[0_0_25px_-4px_rgba(75,68,232,0.6)] transition-all duration-300 hover:scale-[1.03] hover:brightness-115 active:scale-[0.98] cursor-pointer"
              disabled={isUpdating}
            >
              {isUpdating ? "Alterando..." : "Atualizar senha"}
            </Button>
          </div>
        </form>

        {/* Lado Direito - Card de Encerramento de Sessão Premium */}
        <div className="lg:col-span-5 xl:col-span-4 p-6 sm:p-8 rounded-[24px] bg-[linear-gradient(135deg,rgba(239,68,68,0.12)_0%,rgba(239,68,68,0.02)_50%,rgba(239,68,68,0.05)_100%)] border border-red-500/35 shadow-[0_12px_40px_-12px_rgba(239,68,68,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-red-500/50">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/15 blur-[60px] rounded-full pointer-events-none -z-10" />

          <div>
            <div className="flex items-center gap-3.5 pb-4 border-b border-red-500/20 mb-5">
              <div className="size-12 rounded-2xl bg-[linear-gradient(135deg,rgba(239,68,68,0.35)_0%,rgba(239,68,68,0.10)_100%)] border border-red-400/50 flex items-center justify-center text-red-400 shadow-[0_0_20px_-4px_rgba(239,68,68,0.6)] shrink-0">
                <ShieldAlert className="size-6 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">Encerrar sessão</h3>
              </div>
            </div>

            <p className="text-sm text-white font-semibold leading-relaxed">
              Desconecta sua conta deste dispositivo de forma segura. Você precisará fazer login novamente com suas credenciais para acessar a plataforma.
            </p>
          </div>

          <Button
            type="button"
            className="mt-8 w-full h-12 rounded-xl bg-[linear-gradient(135deg,rgba(239,68,68,0.8)_0%,rgba(185,28,28,0.9)_100%)] hover:bg-[linear-gradient(135deg,rgba(239,68,68,0.95)_0%,rgba(220,38,38,1)_100%)] border border-red-400 text-white font-extrabold flex items-center justify-center gap-2.5 transition-all duration-300 shadow-[0_0_25px_-4px_rgba(239,68,68,0.6)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)] hover:scale-[1.02] cursor-pointer active:scale-[0.98]"
            onClick={onLogout}
          >
            <LogOut className="size-5" />
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}
