import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { BrandMark } from "@/components";
import { AuthShell } from "@/layouts/auth-shell";
import { useDocumentTitle } from "@/utils/use-document-title";
import { cn } from "@/utils/utils";
import { RegisterForm } from "./components/register-form";
import { PendingApproval } from "./components/pending-approval";
import type { RegisterFormValues } from "./components/register-form";

export default function RegisterRoute() {
  useDocumentTitle("Cadastro — Estúdio Criativo");
  const [pending, setPending] = useState(false);

  const onSubmit = (data: RegisterFormValues) => {
    // TODO: implement actual registration logic
    setPending(true);
  };

  if (pending) {
    return <PendingApproval />;
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
              Crie sua conta e comece a criar.
            </p>
          </div>

          <div className="mt-7 flex h-11 w-full items-center rounded-full bg-white/5 p-1">
            <Link
              to="/login"
              className={cn(
                "relative flex h-full flex-1 items-center justify-center rounded-full text-sm font-semibold transition-colors text-zinc-500 hover:text-zinc-300"
              )}
            >
              <span className="relative z-10">Entrar</span>
            </Link>

            <Link
              to="/register"
              className={cn(
                "relative flex h-full flex-1 items-center justify-center rounded-full text-sm font-semibold transition-colors text-white/90"
              )}
            >
              <motion.div
                layoutId="auth-tab"
                className="absolute inset-0 rounded-full gradient-brand luminous-glow"
                transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              />
              <span className="relative z-10">Criar conta</span>
            </Link>
          </div>

          <div className="mt-7">
            <RegisterForm onSubmit={onSubmit} />
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
              e{" "}
              <Link
                to="/login"
                className="text-zinc-400 hover:text-white hover:underline transition-colors"
              >
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
