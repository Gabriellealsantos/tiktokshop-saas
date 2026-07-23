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
    <div className="panel p-6">
      <SectionTitle title="Dados da conta" icon={<UserCircle className="size-4 text-zinc-400" />} />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div>
          <Field
            label="Nome completo"
            maxLength={80}
            {...form.register("name")}
            aria-invalid={!!form.formState.errors.name}
            aria-describedby="name-error"
          />
          {form.formState.errors.name && (
            <p id="name-error" className="mt-1 text-xs text-red-400">
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
            className="opacity-70 cursor-not-allowed"
            hint="O e-mail não pode ser alterado por aqui."
          />
        </div>

        <Button type="submit" variant="secondary" disabled={isUpdating}>
          {isUpdating ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </div>
  );
}
