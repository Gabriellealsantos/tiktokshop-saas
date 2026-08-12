import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShieldCheck, Crown } from "lucide-react";

import { SectionTitle } from "@/components";
import type { UserStatus, UserPlan } from "@/models/user";
import { cn } from "@/utils/utils";

import { AvatarUpload } from "./avatar-upload";

const statusColors: Record<UserStatus, string> = {
  aprovado: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_-4px_rgba(16,185,129,0.4)]",
  pendente: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  bloqueado: "bg-red-500/15 text-red-400 border-red-500/30",
};

const planLabels: Record<UserPlan, string> = {
  sem_plano: "Sem Plano",
  mensal: "Plano Mensal",
  trimestral: "Plano Trimestral",
  semestral: "Plano Semestral",
  anual: "Plano Anual",
  vitalicio: "Plano Vitalício",
};

interface AccountInfoProps {
  name: string;
  email: string;
  status: UserStatus;
  role: string;
  plan: UserPlan;
  createdAt: string;
  planExpiresAt?: string | null;
  photoUrl?: string | null;
  onPhotoChange?: () => void;
}

export function AccountHeader({ name, email, status, role, plan, createdAt, photoUrl, onPhotoChange }: AccountInfoProps) {
  const initial = name.charAt(0).toUpperCase();
  const joinedDate = format(new Date(createdAt), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="rounded-[28px] bg-white/[0.02] backdrop-blur-[6px] border border-white/15 ring-1 ring-inset ring-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-32 opacity-20 pointer-events-none">
        <div className="w-72 h-72 brand-gradient rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10">
        <AvatarUpload photoUrl={photoUrl} initial={initial} onChanged={() => onPhotoChange?.()} />
      </div>

      <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{name}</h2>
        <p className="text-base sm:text-lg text-purple-300 font-extrabold mt-1 tracking-wide">{email}</p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-4">
          <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", statusColors[status])}>
            {status}
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[linear-gradient(135deg,rgba(75,68,232,0.25)_0%,rgba(75,68,232,0.10)_100%)] text-brand-300 border border-brand-500/40 shadow-[0_0_15px_-4px_rgba(75,68,232,0.4)]">
            {role}
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/90 border border-white/15 shadow-xs">
            {planLabels[plan]}
          </span>
        </div>

        <p className="text-xs text-white/90 mt-5 flex items-center gap-1.5 font-semibold">
          <ShieldCheck className="size-3.5 text-brand-400" />
          Membro desde <span className="capitalize text-white font-bold">{joinedDate}</span>
        </p>
      </div>
    </div>
  );
}

export function SubscriptionCard({ plan, status, planExpiresAt }: Pick<AccountInfoProps, "plan" | "status" | "planExpiresAt">) {
  const planExpires = planExpiresAt
    ? format(new Date(planExpiresAt), "dd/MM/yyyy", { locale: ptBR })
    : null;

  return (
    <div className="rounded-[28px] bg-white/[0.02] backdrop-blur-[6px] border border-white/15 ring-1 ring-inset ring-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 sm:p-8 flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <SectionTitle title="Plano e Assinatura" icon={<Crown className="size-5 text-brand-400" />} />
          <p className="text-xs sm:text-sm text-white/90 font-medium mt-1">
            Seu status de assinatura e permissões de geração na plataforma NYVOR.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm border",
            status === "aprovado"
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_20px_-4px_rgba(16,185,129,0.4)]"
              : "bg-amber-500/15 text-amber-400 border-amber-500/30")}>
            <span className={cn("size-2 rounded-full", status === "aprovado" ? "bg-emerald-400 animate-pulse" : "bg-amber-400")} />
            {status === "aprovado" ? "Ativo" : status}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center text-center py-10 px-6 sm:px-12 rounded-[24px] bg-[linear-gradient(135deg,rgba(75,68,232,0.10)_0%,rgba(75,68,232,0.01)_50%,rgba(75,68,232,0.03)_100%)] border border-brand-500/35 shadow-[0_12px_40px_-12px_rgba(75,68,232,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] relative overflow-hidden transition-all duration-300 hover:border-brand-400/50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[500px] h-[200px] bg-brand-500/20 blur-[90px] rounded-full pointer-events-none -z-10" />

        <div className="size-20 rounded-[24px] bg-[linear-gradient(135deg,rgba(75,68,232,0.35)_0%,rgba(75,68,232,0.10)_100%)] border border-brand-400/50 shadow-[0_0_35px_-4px_rgba(75,68,232,0.7),inset_0_1px_1px_rgba(255,255,255,0.35)] flex items-center justify-center mb-5 transition-transform duration-500 hover:scale-105">
          <Crown className="size-10 text-brand-300 drop-shadow-[0_0_15px_rgba(150,140,255,0.9)]" />
        </div>

        <p className="text-sm font-semibold text-brand-400 uppercase tracking-widest mb-3">Plano Atual</p>
        <div className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-[linear-gradient(135deg,rgba(109,91,245,0.2)_0%,rgba(109,91,245,0.05)_100%)] border border-brand-400/30 shadow-[0_0_20px_rgba(109,91,245,0.2)]">
          <h3 
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ 
              backgroundImage: "linear-gradient(180deg, #FFFFFF 0%, #D4D3FF 100%)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent", 
              filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))" 
            }}
          >
            {planLabels[plan]}
          </h3>
        </div>
        
        {plan !== "sem_plano" && plan !== "vitalicio" && planExpires && (
          <p className="text-base text-zinc-300 mt-4 font-medium">
            Sua assinatura será renovada em <span className="text-brand-300 font-bold">{planExpires}</span>.
          </p>
        )}
        
        {(plan === "sem_plano" || plan === "vitalicio") && (
          <p className="text-base text-zinc-300 mt-4 font-medium">
            {plan === "sem_plano" ? "Você não possui um plano ativo no momento." : "Você possui acesso vitalício à plataforma."}
          </p>
        )}
      </div>
    </div>
  );
}
