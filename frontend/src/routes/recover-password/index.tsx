import { useState } from "react";
import { AxiosError } from "axios";
import { useParams, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, ShieldCheck, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { BrandMark, Input } from "@/components";
import { AuthLayout } from "@/layouts/auth-layout";
import { useDocumentTitle } from "@/utils/use-document-title";
import { requestBackend } from "@/utils/requests";

const recoverPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RecoverPasswordFormValues = z.infer<typeof recoverPasswordSchema>;

export default function RecoverPasswordRoute() {
  useDocumentTitle("Redefinir senha — Estúdio Criativo");
  const { token } = useParams<{ token: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<RecoverPasswordFormValues>({
    resolver: zodResolver(recoverPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RecoverPasswordFormValues) => {
    setSubmitting(true);
    setError(false);
    try {
      await requestBackend({
        method: "PUT",
        url: "/auth/new-password",
        data: { token, password: data.password },
      });
      setSuccess(true);
      toast.success("Senha redefinida com sucesso!");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; error?: string }>;
      const message =
        axiosErr?.response?.data?.message ||
        axiosErr?.response?.data?.error ||
        "Token inválido ou expirado. Solicite uma nova recuperação.";
      setError(true);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[400px] mx-auto flex flex-col">
        <div className="flex flex-col items-center text-center">
          <BrandMark className="h-20 drop-shadow-[0_0_15px_rgba(109,91,245,0.6)]" />

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex flex-col items-center"
              >
                <div className="mt-6 flex size-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <ShieldCheck className="size-8 text-emerald-400" />
                </div>
                <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white">
                  Senha redefinida!
                </h1>
                <p className="mt-2 text-sm text-zinc-400 max-w-[320px]">
                  Sua senha foi alterada com sucesso. Agora você pode fazer
                  login com a nova senha.
                </p>
                <Link
                  to="/login"
                  className="mt-8 flex h-12 w-full items-center justify-center rounded-[11px] gradient-brand luminous-glow text-sm font-bold text-white/90 drop-shadow-sm transition-all hover:luminous-glow-hover hover:brightness-110"
                >
                  Ir para o login
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="w-full"
              >
                <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white">
                  Redefinir senha
                </h1>
                <p className="mt-2 text-sm text-zinc-400">
                  Crie uma nova senha segura para sua conta.
                </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  >
                    <AlertTriangle className="size-4 shrink-0" />
                    Token inválido ou expirado. Solicite uma nova recuperação.
                  </motion.div>
                )}

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-8 space-y-4"
                >
                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">
                      Nova senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                      <Input
                        {...form.register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-10 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-xs text-danger">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">
                      Confirmar nova senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                      <Input
                        {...form.register("confirmPassword")}
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-10 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                      >
                        {showConfirm ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {form.formState.errors.confirmPassword && (
                      <p className="text-xs text-danger">
                        {form.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <motion.button
                    whileHover={submitting ? undefined : { scale: 1.02 }}
                    whileTap={submitting ? undefined : { scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="relative mt-6 flex h-12 w-full items-center justify-center rounded-[11px] gradient-brand luminous-glow text-sm font-bold text-white/90 drop-shadow-sm transition-all hover:luminous-glow-hover hover:brightness-110 disabled:opacity-60"
                  >
                    {submitting ? "Salvando…" : "Redefinir senha"}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
