import { useState, useMemo, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { User, UserRole, UserPlan } from "@/models/user";
import { mapUserResponse, type UserResponse } from "@/models/user";
import { findAllUsers, updateUser } from "@/services/userService";
import { planToBackend } from "@/models/subscription";
import { activateSubscription, revokeSubscription, cancelSubscription } from "@/services/subscriptionService";

import { UserFilters } from "./components/user-filters";
import { UserCard } from "./components/user-card";

interface UsersTabProps {
  pendingCount: number;
  onPendingCountChange: (count: number) => void;
}

export function UsersTab({ pendingCount, onPendingCountChange }: UsersTabProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<Record<string, UserPlan>>({});
  const [pendingRole, setPendingRole] = useState<Record<string, UserRole>>({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<User["status"] | "todos">("todos");
  const [roleFilter, setRoleFilter] = useState<UserRole | "todas">("todas");
  const [planFilter, setPlanFilter] = useState<UserPlan | "todos">("todos");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await findAllUsers({ page: 0, size: 100 });
      const content: UserResponse[] = res.data.content ?? [];
      const mapped = content.map(mapUserResponse);
      setUsers(mapped);
      onPendingCountChange(mapped.filter((u) => u.status === "pendente").length);
    } catch {
      toast.error("Falha ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, [onPendingCountChange]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "todos" || u.status === statusFilter;
      const matchRole = roleFilter === "todas" || u.role === roleFilter;
      const matchPlan = planFilter === "todos" || u.plan === planFilter;
      return matchSearch && matchStatus && matchRole && matchPlan;
    });
  }, [users, search, statusFilter, roleFilter, planFilter]);

  const handlePlanChange = (id: string, plan: UserPlan) => {
    setPendingPlan((prev) => ({ ...prev, [id]: plan }));
  };

  const handleRoleChange = (id: string, role: UserRole) => {
    setPendingRole((prev) => ({ ...prev, [id]: role }));
  };

  // "Liberar" = ativar assinatura no plano escolhido + aprovar o usuário.
  // Regra: exige um plano (≠ "Sem Plano"); a contagem começa neste momento.
  const handleAtualizar = async (user: User) => {
    const plan = pendingPlan[user.id] ?? user.plan;
    const role = pendingRole[user.id] ?? user.role;
    
    if (plan === user.plan && role === user.role && user.status !== "pendente") {
      return;
    }

    setActioningId(user.id);
    try {
      let newStatus = user.status;

      if (plan !== user.plan || (user.status === "pendente" && plan !== "sem_plano")) {
        if (plan === "sem_plano") {
          await cancelSubscription(user.id);
        } else {
          await activateSubscription(user.id, planToBackend[plan]);
          if (user.status === "pendente") newStatus = "aprovado";
        }
      }

      if (role !== user.role) {
         const roleIdMap: Record<UserRole, number> = { admin: 1, afiliado: 2, user: 3 };
         const roleNameMap: Record<UserRole, string> = { admin: "ROLE_ADMIN", afiliado: "ROLE_AFFILIATE", user: "ROLE_CLIENT" };
         
         await updateUser(user.id, {
            name: user.name,
            email: user.email,
            roles: [{ id: roleIdMap[role], authority: roleNameMap[role] }]
         } as any);
      }

      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, plan, role, status: newStatus } : u)));
      toast.success("Usuário atualizado com sucesso.");
    } catch {
      toast.error("Falha ao atualizar o usuário.");
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleBlock = async (user: User) => {
    const isBlocked = user.status === "bloqueado";
    setActioningId(user.id);
    try {
      if (isBlocked) {
        await updateUser(user.id, { name: user.name, email: user.email, userStatus: "ACTIVE" } as any);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: "aprovado" } : u)));
        toast.success("Acesso desbloqueado.");
      } else {
        await revokeSubscription(user.id);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: "bloqueado", plan: "sem_plano" } : u)));
        toast.success("Acesso bloqueado.");
      }
    } catch {
      toast.error(isBlocked ? "Falha ao desbloquear." : "Falha ao bloquear.");
    } finally {
      setActioningId(null);
    }
  };

  const statusCounts = {
    total: users.length,
    aprovado: users.filter((u) => u.status === "aprovado").length,
    pendente: users.filter((u) => u.status === "pendente").length,
    bloqueado: users.filter((u) => u.status === "bloqueado").length,
  };

  return (
    <div className="space-y-6 entrance">
      <UserFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        planFilter={planFilter}
        onPlanFilterChange={setPlanFilter}
        statusCounts={statusCounts}
      />

      <div className="flex items-center justify-between text-sm text-zinc-400 mt-2 border-b border-white/5 pb-4">
        <span>{filteredUsers.length} usuários</span>
        <span>Página 1 de 1</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
          <Loader2 className="size-4 animate-spin" /> Carregando usuários…
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredUsers.map((user) => {
            const selectedPlan = pendingPlan[user.id] ?? user.plan;
            const selectedRole = pendingRole[user.id] ?? user.role;
            const busy = actioningId === user.id;
            const hasChanges = selectedPlan !== user.plan || selectedRole !== user.role || user.status === "pendente";
            return (
              <UserCard
                key={user.id}
                user={user}
                selectedPlan={selectedPlan}
                selectedRole={selectedRole}
                busy={busy}
                hasChanges={hasChanges}
                onPlanChange={handlePlanChange}
                onRoleChange={handleRoleChange}
                onAtualizar={handleAtualizar}
                onToggleBlock={handleToggleBlock}
              />
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-sm">
              Nenhum usuário encontrado com os filtros atuais.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
