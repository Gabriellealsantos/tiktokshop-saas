import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KeyRound, LogOut } from "lucide-react";
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
    // onTouched: valida (inclusive o "as senhas não coincidem") ao sair do campo, não só no submit.
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
    <div className="panel p-6 md:col-span-2">
      <SectionTitle title="Segurança" icon={<KeyRound className="size-4 text-zinc-400" />} />

      <div className="grid gap-8 md:grid-cols-2 mt-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <h3 className="text-sm font-medium text-white mb-4">Alterar senha</h3>

          <div>
            <Field
              type="password"
              label="Senha atual"
              {...form.register("currentPassword")}
              aria-invalid={!!form.formState.errors.currentPassword}
            />
            {form.formState.errors.currentPassword && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Field
                type="password"
                label="Nova senha"
                {...form.register("newPassword")}
                aria-invalid={!!form.formState.errors.newPassword}
              />
              {form.formState.errors.newPassword && (
                <p className="mt-1 text-xs text-red-400">{form.formState.errors.newPassword.message}</p>
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
                <p className="mt-1 text-xs text-red-400">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" variant="secondary" disabled={isUpdating}>
            {isUpdating ? "Alterando..." : "Atualizar senha"}
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
            onClick={onLogout}
          >
            <LogOut className="size-4 mr-2" />
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}
