import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShieldCheck } from "lucide-react";

import { SectionTitle } from "@/components";
import type { UserStatus, UserPlan } from "@/models/user";
import { cn } from "@/utils/utils";

import { AvatarUpload } from "./avatar-upload";

const statusColors: Record<UserStatus, string> = {
  aprovado: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pendente: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  bloqueado: "bg-red-500/10 text-red-400 border-red-500/20",
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
    <div className="panel p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-32 opacity-20 pointer-events-none">
        <div className="w-64 h-64 brand-gradient rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <AvatarUpload photoUrl={photoUrl} initial={initial} onChanged={() => onPhotoChange?.()} />
      </div>

      <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
        <h2 className="text-2xl font-bold text-white">{name}</h2>
        <p className="text-sm text-zinc-400 mt-1">{email}</p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
          <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", statusColors[status])}>
            {status}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20">
            {role}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-zinc-300 border border-white/10">
            {planLabels[plan]}
          </span>
        </div>

        <p className="text-xs text-zinc-500 mt-4">
          Membro desde <span className="capitalize">{joinedDate}</span>
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
    <div className="panel p-6 flex flex-col">
      <SectionTitle title="Plano e Assinatura" icon={<ShieldCheck className="size-4 text-zinc-400" />} />

      <div className="mt-4 flex-1">
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <div>
            <p className="text-sm font-medium text-white">{planLabels[plan]}</p>
            {plan !== "sem_plano" && plan !== "vitalicio" && planExpires && (
              <p className="text-xs text-zinc-400 mt-1">Renova em {planExpires}</p>
            )}
          </div>
          <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase",
            status === "aprovado" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400")}>
            {status === "aprovado" ? "Ativo" : status}
          </span>
        </div>
      </div>
    </div>
  );
}
