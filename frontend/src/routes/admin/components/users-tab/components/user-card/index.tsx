import { Ban, Check, CircleUser, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components";
import type { User, UserRole, UserPlan, UserStatus } from "@/models/user";
import { cn } from "@/utils/utils";

const statusColors: Record<UserStatus, string> = {
  aprovado: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pendente: "bg-brand-500/10 text-brand-400 border-brand-500/20",
  bloqueado: "bg-red-500/10 text-red-400 border-red-500/20",
};

const planLabels: Record<UserPlan, string> = {
  sem_plano: "Sem Plano",
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
  vitalicio: "Vitalício",
};

interface UserCardProps {
  user: User;
  selectedPlan: UserPlan;
  selectedRole: UserRole;
  busy: boolean;
  hasChanges: boolean;
  onPlanChange: (id: string, plan: UserPlan) => void;
  onRoleChange: (id: string, role: UserRole) => void;
  onAtualizar: (user: User) => void;
  onToggleBlock: (user: User) => void;
}

export function UserCard({
  user, selectedPlan, selectedRole, busy, hasChanges,
  onPlanChange, onRoleChange, onAtualizar, onToggleBlock,
}: UserCardProps) {
  const isBlocked = user.status === "bloqueado";

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 rounded-[16px] border p-5 transition-colors",
        user.status === "pendente"
          ? "border-brand-500/30 bg-brand-500/[0.03] hover:bg-brand-500/[0.05]"
          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]",
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-bold text-white truncate">{user.email}</span>
          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", statusColors[user.status])}>
            {user.status}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20">
            {user.role}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <CircleUser className="size-3.5 opacity-70" />
          <span className="truncate">{user.name}</span>
          <span className="mx-1 opacity-50">•</span>
          <span>Criado {format(new Date(user.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 lg:shrink-0 mt-3 lg:mt-0 pt-3 lg:pt-0 border-t border-white/5 lg:border-t-0">
        <Select value={selectedPlan} onValueChange={(val: UserPlan) => onPlanChange(user.id, val)}>
          <SelectTrigger className="w-[140px] h-9 bg-black/40 border-white/10 text-xs">
            <SelectValue placeholder="Plano" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300">
            {Object.entries(planLabels).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-xs focus:bg-white/10 focus:text-white cursor-pointer">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedRole} onValueChange={(val: UserRole) => onRoleChange(user.id, val)}>
          <SelectTrigger className="w-[120px] h-9 bg-black/40 border-white/10 text-xs">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300">
            <SelectItem value="admin" className="text-xs">Admin</SelectItem>
            <SelectItem value="afiliado" className="text-xs">Afiliado</SelectItem>
            <SelectItem value="user" className="text-xs">User</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-9 px-3 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 disabled:opacity-30 disabled:border-transparent"
            onClick={() => onAtualizar(user)}
            disabled={busy || !hasChanges || isBlocked}
          >
            {busy ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Check className="size-3.5 mr-1.5" />}
            Atualizar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-9 px-3 disabled:opacity-30 disabled:border-transparent",
              isBlocked
                ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20"
                : "text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
            )}
            onClick={() => onToggleBlock(user)}
            disabled={busy}
          >
            <Ban className="size-3.5 mr-1.5" />
            {isBlocked ? "Desbloquear" : "Bloquear"}
          </Button>
        </div>
      </div>
    </div>
  );
}
