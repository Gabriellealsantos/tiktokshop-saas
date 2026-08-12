import { useState } from "react";
import { motion } from "motion/react";
import axios from "axios";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components";
import { AuthLayout } from "@/layouts/auth-layout";
import { useDocumentTitle } from "@/utils/use-document-title";
import { register } from "@/services/authService";
import { RegisterForm } from "./components/register-form";
import { PendingApproval } from "./components/pending-approval";
import type { RegisterFormValues } from "./components/register-form";
import { BASE_URL } from "@/utils/system";

export default function RegisterRoute() {
  useDocumentTitle("Cadastro — Estúdio Criativo");
  const [pending, setPending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: RegisterFormValues) => {
    setSubmitting(true);
    try {
      await register({ name: data.name, email: data.email, password: data.password });
      setPending(true);
    } catch (error) {
      const message =
        axios.isAxiosError(error) && typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Não foi possível concluir o cadastro. Tente novamente.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (pending) {
    return <PendingApproval />;
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-[400px] mx-auto flex flex-col">
        <div className="flex flex-col items-center text-center">
          <BrandMark className="h-20 drop-shadow-[0_0_15px_rgba(109,91,245,0.6)]" />
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white">
            Bem-vindo à <span style={{ backgroundImage: "linear-gradient(180deg, #D4D3FF 0%, var(--brand-purple) 60%, #1a1661 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 15px var(--brand-purple))", display: "inline-block" }}>NYVOR</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Crie sua conta e comece a criar.
          </p>
        </div>

        {/* Toggle Entrar / Criar conta */}
        <div className="mt-8 flex h-12 w-full items-center rounded-full bg-white/5 p-1">
          <a
            href={`${BASE_URL}/login`}
            className="relative flex h-full flex-1 items-center justify-center rounded-full text-sm font-semibold transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <span className="relative z-10">Entrar</span>
          </a>

          <div className="relative flex h-full flex-1 items-center justify-center rounded-full text-sm font-semibold text-white/90">
            <motion.div
              layoutId="auth-tab"
              className="absolute inset-0 rounded-full gradient-brand luminous-glow"
              transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
            />
            <span className="relative z-10">Criar conta</span>
          </div>
        </div>

        {/* Banner de Aviso */}
        <div className="mt-6 flex items-start gap-3 rounded-[12px] border border-[var(--brand-purple)]/30 bg-[var(--brand-purple)]/10 p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[var(--brand-purple)]" />
          <p className="text-[13px] leading-[1.4] text-white">
            Acesso exclusivo para quem já adquiriu a plataforma. Use o <span className="font-bold">mesmo e-mail</span> da compra para liberar sua conta.
          </p>
        </div>

        <div className="mt-6">
          <RegisterForm onSubmit={onSubmit} submitting={submitting} />
          <div className="mt-4 text-center">
            <p className="text-[13px] text-zinc-400">
              Já tem conta? <a href={`${BASE_URL}/login`} className="font-bold text-white hover:opacity-80 transition-opacity">Entrar</a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[11px] text-zinc-500 leading-relaxed px-4">
            Ao continuar, você concorda com nossos{" "}
            <a
              href={`${BASE_URL}/login`}
              className="font-bold text-white hover:opacity-80 transition-opacity"
            >
              Termos
            </a>{" "}
            e{" "}
            <a
              href={`${BASE_URL}/login`}
              className="font-bold text-white hover:opacity-80 transition-opacity"
            >
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
