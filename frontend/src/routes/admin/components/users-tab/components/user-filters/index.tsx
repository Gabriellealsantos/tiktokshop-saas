import { Search, X } from "lucide-react";

import {
  Pill, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components";
import type { UserRole, UserPlan, UserStatus } from "@/models/user";

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: UserStatus | "todos";
  onStatusFilterChange: (value: UserStatus | "todos") => void;
  roleFilter: UserRole | "todas";
  onRoleFilterChange: (value: UserRole | "todas") => void;
  planFilter: UserPlan | "todos";
  onPlanFilterChange: (value: UserPlan | "todos") => void;
  statusCounts: Record<UserStatus | "total", number>;
}

export function UserFilters({
  search, onSearchChange,
  statusFilter, onStatusFilterChange,
  roleFilter, onRoleFilterChange,
  planFilter, onPlanFilterChange,
  statusCounts,
}: UserFiltersProps) {
  const hasActiveFilters = search || statusFilter !== "todos" || roleFilter !== "todas" || planFilter !== "todos";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por email ou nome..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-[12px] border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
          <Select value={roleFilter} onValueChange={(val: string) => onRoleFilterChange(val as UserRole | "todas")}>
            <SelectTrigger className="w-full sm:w-[160px] h-11 bg-white/5 border-white/10 text-sm">
              <SelectValue placeholder="Roles" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300">
              <SelectItem value="todas">Todas Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="afiliado">Afiliado</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>

          <Select value={planFilter} onValueChange={(val: string) => onPlanFilterChange(val as UserPlan | "todos")}>
            <SelectTrigger className="w-full sm:w-[160px] h-11 bg-white/5 border-white/10 text-sm">
              <SelectValue placeholder="Planos" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10 text-zinc-300">
              <SelectItem value="todos">Todos Planos</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="semestral">Semestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
              <SelectItem value="vitalicio">Vitalício</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Pill active={statusFilter === "todos"} onClick={() => onStatusFilterChange("todos")}>
          Todos <span className="ml-1.5 opacity-50">{statusCounts.total}</span>
        </Pill>
        <Pill active={statusFilter === "aprovado"} onClick={() => onStatusFilterChange("aprovado")}>
          Aprovados <span className="ml-1.5 opacity-50">{statusCounts.aprovado}</span>
        </Pill>
        <Pill active={statusFilter === "pendente"} onClick={() => onStatusFilterChange("pendente")}>
          Pendentes <span className="ml-1.5 opacity-50">{statusCounts.pendente}</span>
        </Pill>
        <Pill active={statusFilter === "bloqueado"} onClick={() => onStatusFilterChange("bloqueado")}>
          Bloqueados <span className="ml-1.5 opacity-50">{statusCounts.bloqueado}</span>
        </Pill>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-zinc-500 mr-1">Filtros ativos:</span>
          {search && (
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
              Busca: {search}
              <button onClick={() => onSearchChange("")} className="hover:text-white"><X className="size-3" /></button>
            </span>
          )}
          {statusFilter !== "todos" && (
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
              Status: {statusFilter}
              <button onClick={() => onStatusFilterChange("todos")} className="hover:text-white"><X className="size-3" /></button>
            </span>
          )}
          {roleFilter !== "todas" && (
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
              Role: {roleFilter}
              <button onClick={() => onRoleFilterChange("todas")} className="hover:text-white"><X className="size-3" /></button>
            </span>
          )}
          {planFilter !== "todos" && (
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
              Plano: {planFilter}
              <button onClick={() => onPlanFilterChange("todos")} className="hover:text-white"><X className="size-3" /></button>
            </span>
          )}
          <button
            onClick={() => {
              onSearchChange("");
              onStatusFilterChange("todos");
              onRoleFilterChange("todas");
              onPlanFilterChange("todos");
            }}
            className="text-xs text-brand-400 hover:text-brand-300 hover:underline ml-2"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
