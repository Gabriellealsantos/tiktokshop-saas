import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Input } from "@/components";
import { useMockSession } from "@/context/mock-session";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useMockSession();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Fluxo PKCE: o "Entrar" redireciona para o /oauth2/authorize do back, onde a
  // autenticação de fato acontece (a tela de credenciais é servida pelo back).
  // As credenciais digitadas aqui não são usadas nesta etapa — na Fase 3.1 o
  // design deste formulário será portado para a página de login do back.
  const onSubmit = () => {
    login();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            {...form.register("email")}
            type="email"
            placeholder="voce@exemplo.com"
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-10 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
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
            placeholder="••••••••"
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-10 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <div className="flex items-center justify-between pt-1">
          {form.formState.errors.password ? (
            <p className="text-xs text-danger">
              {form.formState.errors.password.message}
            </p>
          ) : (
            <span />
          )}
          <Link
            to="/login"
            className="text-[11px] font-medium text-accent-400 hover:underline"
          >
            {" "}
            {/* TODO: replace with proper reset route */}
            Esqueci minha senha
          </Link>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="relative mt-6 flex h-12 w-full items-center justify-center rounded-[11px] gradient-brand luminous-glow text-sm font-bold text-white/90 drop-shadow-sm transition-all hover:luminous-glow-hover hover:brightness-110"
      >
        Entrar
      </motion.button>
    </form>
  );
}
