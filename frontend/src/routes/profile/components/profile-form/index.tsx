import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";

import { SectionTitle, Button, Field } from "@/components";
import { UserCircle } from "lucide-react";
import { updateMe } from "@/services/userService";
import { useAuth } from "@/context/auth";
import { profileSchema, type ProfileForm as ProfileFormType } from "../../schema";

interface ProfileFormProps {
  userName: string;
  userEmail: string;
}

export function ProfileForm({ userName, userEmail }: ProfileFormProps) {
  const { reloadUser, user: authUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<ProfileFormType>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    defaultValues: { name: userName },
  });

  // Sincroniza o form quando o usuário do contexto carrega/atualiza.
  useEffect(() => {
    form.reset({ name: userName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const onSubmit = async (data: ProfileFormType) => {
    setIsUpdating(true);
    try {
      await updateMe({ name: data.name });
      await reloadUser();
      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Falha ao atualizar o perfil.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="rounded-[28px] bg-white/[0.02] backdrop-blur-[6px] border border-white/15 ring-1 ring-inset ring-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 sm:p-8">
      <SectionTitle title="Dados da conta" icon={<UserCircle className="size-5 text-brand-400" />} />
      <p className="text-xs sm:text-sm text-white/90 font-medium mt-1 mb-6">
        Atualize suas informações de perfil e visualize o e-mail cadastrado na plataforma.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Field
              label="Nome completo"
              maxLength={80}
              {...form.register("name")}
              aria-invalid={!!form.formState.errors.name}
              aria-describedby="name-error"
            />
            {form.formState.errors.name && (
              <p id="name-error" className="mt-1.5 text-xs text-red-400 font-medium">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Field
              label="E-mail"
              value={userEmail}
              readOnly
              disabled
              className="opacity-65 cursor-not-allowed border-white/10 bg-white/[0.02]"
              hint="O e-mail não pode ser alterado por aqui."
            />
          </div>
        </div>

        <div className="flex justify-start pt-2 border-t border-white/5">
          <Button
            type="submit"
            className="btn-brand gradient-brand px-8 h-11 rounded-xl font-bold text-white shadow-[0_0_20px_-4px_rgba(75,68,232,0.5)] transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
            disabled={isUpdating}
          >
            {isUpdating ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
