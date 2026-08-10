import { Mail } from "lucide-react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Input } from "@/components";

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({
  onSubmit,
  submitting = false,
}: {
  onSubmit: (data: ForgotPasswordFormValues) => void;
  submitting?: boolean;
}) {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            {...form.register("email")}
            type="email"
            placeholder="voce@exemplo.com"
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-10 text-white focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-xs text-danger">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <motion.button
        whileHover={submitting ? undefined : { scale: 1.02 }}
        whileTap={submitting ? undefined : { scale: 0.98 }}
        type="submit"
        disabled={submitting}
        className="relative mt-6 flex h-12 w-full items-center justify-center rounded-full gradient-brand luminous-glow text-sm font-bold text-white/90 drop-shadow-sm transition-all hover:luminous-glow-hover hover:brightness-110 disabled:opacity-60"
      >
        {submitting ? "Enviando…" : "Enviar link de recuperação"}
      </motion.button>
    </form>
  );
}
