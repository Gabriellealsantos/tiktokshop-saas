import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Input } from "@/components";

export const registerSchema = z
  .object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
    // Back exige mínimo 8 e sem espaços (@Password) — alinhado aqui.
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .refine((v) => !/\s/.test(v), "A senha não pode conter espaços"),
    confirmPassword: z.string().min(1, "A confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm({
  onSubmit,
  submitting = false,
}: {
  onSubmit: (data: RegisterFormValues) => void;
  submitting?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <div className="relative">
          <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            {...form.register("name")}
            placeholder="Seu nome"
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-10 text-white focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
          />
        </div>
        {form.formState.errors.name && (
          <p className="text-xs text-danger">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

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

      <div className="space-y-1">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            {...form.register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-10 text-white focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
          >
            <EyeOff className={`absolute size-4 transition-all duration-300 ${showPassword ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-45"}`} />
            <Eye className={`absolute size-4 transition-all duration-300 ${!showPassword ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-45"}`} />
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-xs text-danger">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            {...form.register("confirmPassword")}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar senha"
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-10 text-white focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
          >
            {showConfirmPassword ? (
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
        className="relative mt-6 flex h-12 w-full items-center justify-center rounded-full gradient-brand luminous-glow text-sm font-bold text-white/90 drop-shadow-sm transition-all hover:luminous-glow-hover hover:brightness-110 disabled:opacity-60"
      >
        {submitting ? "Criando…" : "Criar conta"}
      </motion.button>
    </form>
  );
}
