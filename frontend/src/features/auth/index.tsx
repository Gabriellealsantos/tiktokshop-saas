import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Mail, User, Clock3 } from "lucide-react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { BrandMark, Button, Input } from "@/components";
import { AuthShell } from "@/layouts/auth-shell";
import { useMockSession } from "@/context/mock-session";
import { cn } from "@/utils/utils";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

const registerSchema = z
  .object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "A confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const [pending, setPending] = useState(false);
  const { login } = useMockSession();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onLoginSubmit = (data: LoginForm) => {
    login();
    navigate({ to: "/" });
  };

  const onRegisterSubmit = (data: RegisterForm) => {
    setPending(true);
  };

  if (pending) {
    return (
      <AuthShell>
        <div className="relative mx-auto w-full max-w-[420px] rounded-[24px] p-[1px] overflow-hidden entrance">
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "conic-gradient(from var(--border-angle), transparent 0%, transparent 70%, var(--accent-500) 85%, transparent 100%)",
              animation: "border-spin 4s linear infinite",
            }}
          />
          <div className="relative z-10 w-full rounded-[23px] bg-[#09080e] p-8 text-center shadow-2xl border border-white/5">
            <BrandMark className="mx-auto h-20 drop-shadow-[0_0_15px_rgba(109,91,245,0.6)]" />
            <span className="mx-auto mt-8 grid size-16 place-items-center rounded-full bg-warning/10 text-warning">
              <Clock3 className="size-7" />
            </span>
            <h1 className="mt-6 text-2xl font-bold">Conta pendente de aprovação</h1>
            <p className="mt-3 text-sm leading-6 text-text-2">
              Recebemos seu cadastro. Um administrador vai revisar seus dados e liberar o acesso.
            </p>
            <Link to="/login" className="mt-7 block">
              <Button variant="secondary" className="w-full">
                Voltar ao login
              </Button>
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="relative mx-auto w-full max-w-[420px] rounded-[24px] p-[1px] overflow-hidden entrance">
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "conic-gradient(from var(--border-angle), transparent 0%, transparent 70%, var(--accent-500) 85%, transparent 100%)",
            animation: "border-spin 4s linear infinite",
          }}
        />

        <div className="relative z-10 w-full rounded-[23px] bg-[#09080e] p-7 md:p-8 shadow-2xl border border-white/5">
          <div className="flex flex-col items-center text-center">
            <BrandMark className="h-20 drop-shadow-[0_0_15px_rgba(109,91,245,0.6)]" />
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-white">
              Bem-vindo!
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {mode === "login"
                ? "Entre para continuar criando."
                : "Crie sua conta e comece a criar."}
            </p>
          </div>

          <div className="mt-7 flex h-11 w-full items-center rounded-full bg-white/5 p-1">
            <Link
              to="/login"
              className={cn(
                "relative flex h-full flex-1 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                mode === "login" ? "text-white/90" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {mode === "login" && (
                <motion.div
                  layoutId="auth-tab"
                  className="absolute inset-0 rounded-full gradient-brand luminous-glow"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                />
              )}
              <span className="relative z-10">Entrar</span>
            </Link>

            <Link
              to="/register"
              className={cn(
                "relative flex h-full flex-1 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                mode === "register" ? "text-white/90" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {mode === "register" && (
                <motion.div
                  layoutId="auth-tab"
                  className="absolute inset-0 rounded-full gradient-brand luminous-glow"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                />
              )}
              <span className="relative z-10">Criar conta</span>
            </Link>
          </div>

          <div className="mt-7">
            {mode === "login" ? (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      {...loginForm.register("email")}
                      type="email"
                      placeholder="voce@exemplo.com"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-10 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-danger">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      {...loginForm.register("password")}
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
                    {loginForm.formState.errors.password ? (
                      <p className="text-xs text-danger">
                        {loginForm.formState.errors.password.message}
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
            ) : (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      {...registerForm.register("name")}
                      placeholder="Seu nome"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-10 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
                    />
                  </div>
                  {registerForm.formState.errors.name && (
                    <p className="text-xs text-danger">
                      {registerForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      {...registerForm.register("email")}
                      type="email"
                      placeholder="voce@exemplo.com"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-10 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-danger">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      {...registerForm.register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Senha"
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
                  {registerForm.formState.errors.password && (
                    <p className="text-xs text-danger">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      {...registerForm.register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmar senha"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-10 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
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
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-danger">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="relative mt-6 flex h-12 w-full items-center justify-center rounded-[11px] gradient-brand luminous-glow text-sm font-bold text-white/90 drop-shadow-sm transition-all hover:luminous-glow-hover hover:brightness-110"
                >
                  Criar conta
                </motion.button>
              </form>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-[11px] text-zinc-500 leading-relaxed px-4">
              Ao continuar, você concorda com nossos{" "}
              <Link
                to="/login"
                className="text-zinc-400 hover:text-white hover:underline transition-colors"
              >
                Termos
              </Link>{" "}
              {/* TODO: replace with proper terms route */} e{" "}
              <Link
                to="/login"
                className="text-zinc-400 hover:text-white hover:underline transition-colors"
              >
                Política de Privacidade
              </Link>
              . {/* TODO: replace with proper privacy route */}
            </p>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
