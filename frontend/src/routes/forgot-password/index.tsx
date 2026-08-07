import { useState } from "react";
import { toast } from "sonner";
import { BrandMark } from "@/components";
import { AuthLayout } from "@/layouts/auth-layout";
import { useDocumentTitle } from "@/utils/use-document-title";
import { BASE_URL } from "@/utils/system";
import { requestBackend } from "@/utils/requests";
import { ForgotPasswordForm } from "./components/forgot-password-form";
import type { ForgotPasswordFormValues } from "./components/forgot-password-form";

export default function ForgotPasswordRoute() {
  useDocumentTitle("Recuperar senha — Estúdio Criativo");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setSubmitting(true);
    try {
      await requestBackend({
        method: "POST",
        url: "/auth/recover-token",
        data: { email: data.email },
      });
      setSuccess(true);
      toast.success("Link de recuperação enviado para " + data.email);
    } catch (error) {
      toast.error("Não foi possível enviar o link de recuperação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[400px] mx-auto flex flex-col">
        <div className="flex flex-col items-center text-center">
          <BrandMark className="h-20 drop-shadow-[0_0_15px_rgba(109,91,245,0.6)]" />
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white">
            Recuperar senha
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {success 
              ? "Verifique sua caixa de entrada para redefinir sua senha."
              : "Informe seu e-mail e enviaremos um link para redefinir sua senha."}
          </p>
        </div>

        {!success && (
          <div className="mt-8">
            <ForgotPasswordForm onSubmit={onSubmit} submitting={submitting} />
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href={`${BASE_URL}/login`}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Voltar para o login
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}
