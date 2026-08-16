import { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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

const PAGE_SIZE = 20;

export function UsersTab({ onPendingCountChange }: UsersTabProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<Record<string, UserPlan>>({});
  const [pendingRole, setPendingRole] = useState<Record<string, UserRole>>({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<User["status"] | "todos">("todos");
  const [roleFilter, setRoleFilter] = useState<UserRole | "todas">("todas");
  const [planFilter, setPlanFilter] = useState<UserPlan | "todos">("todos");

  // ── Paginação real (backend) ─────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Contadores globais (sem filtro) – buscados uma vez à parte para manter as
  // badges das pílulas de status precisas mesmo quando em outra página.
  const [globalCounts, setGlobalCounts] = useState({ total: 0, aprovado: 0, pendente: 0, bloqueado: 0 });

  const loadGlobalCounts = useCallback(async () => {
    try {
      // Busca todos só para contar (size grande, uma chamada só)
      const res = await findAllUsers({ page: 0, size: 10000 });
      const content: UserResponse[] = res.data.content ?? [];
      const mapped = content.map(mapUserResponse);
      const counts = {
        total: mapped.length,
        aprovado: mapped.filter((u) => u.status === "aprovado").length,
        pendente: mapped.filter((u) => u.status === "pendente").length,
        bloqueado: mapped.filter((u) => u.status === "bloqueado").length,
      };
      setGlobalCounts(counts);
      onPendingCountChange(counts.pendente);
    } catch {
      // silencioso — contadores ficam com o valor anterior
    }
  }, [onPendingCountChange]);

  const loadUsers = useCallback(async (pageToLoad: number) => {
    setLoading(true);
    try {
      const res = await findAllUsers({ page: pageToLoad, size: PAGE_SIZE });
      const content: UserResponse[] = res.data.content ?? [];
      const mapped = content.map(mapUserResponse);
      setUsers(mapped);
      setTotalPages(res.data.totalPages ?? 1);
      setTotalElements(res.data.totalElements ?? mapped.length);
    } catch {
      toast.error("Falha ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGlobalCounts();
  }, [loadGlobalCounts]);

  useEffect(() => {
    loadUsers(page);
  }, [page, loadUsers]);

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
      let statusUpdatedToActive = false;

      // Handle subscription/plan logic
      if (plan !== user.plan || (user.status === "pendente" && plan !== "sem_plano")) {
        if (plan === "sem_plano") {
          await cancelSubscription(user.id);
        } else {
          await activateSubscription(user.id, planToBackend[plan]);
          if (user.status === "pendente") newStatus = "aprovado";
        }
      }

      // Se for admin, a aprovação é liberada sem exigir plano
      if (role === "admin" && user.status === "pendente") {
        newStatus = "aprovado";
        statusUpdatedToActive = true;
      }

      // Atualiza os dados no backend caso tenha mudado a role OU caso precise ativar a conta do admin
      if (role !== user.role || statusUpdatedToActive) {
         const roleIdMap: Record<UserRole, number> = { admin: 1, afiliado: 2, user: 3 };
         const roleNameMap: Record<UserRole, string> = { admin: "ROLE_ADMIN", afiliado: "ROLE_AFFILIATE", user: "ROLE_CLIENT" };
         
         const payload: any = {
            name: user.name,
            email: user.email,
            roles: [{ id: roleIdMap[role], authority: roleNameMap[role] }],
         };
         
         if (statusUpdatedToActive) {
            payload.userStatus = "ACTIVE";
         }
         
         await updateUser(user.id, payload);
      }

      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, plan, role, status: newStatus } : u)));
      toast.success("Usuário atualizado com sucesso.");
      loadGlobalCounts(); // Atualiza contadores globais
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
        await updateUser(user.id, { name: user.name, email: user.email, userStatus: "ACTIVE" });
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: "aprovado" } : u)));
        toast.success("Acesso desbloqueado.");
      } else {
        await revokeSubscription(user.id);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: "bloqueado", plan: "sem_plano" } : u)));
        toast.success("Acesso bloqueado.");
      }
      loadGlobalCounts(); // Atualiza contadores globais
    } catch {
      toast.error(isBlocked ? "Falha ao desbloquear." : "Falha ao bloquear.");
    } finally {
      setActioningId(null);
    }
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
        statusCounts={globalCounts}
      />

      <div className="flex items-center justify-between text-sm text-zinc-400 mt-2 border-b border-white/5 pb-4">
        <span>{totalElements} usuários</span>
        <div className="flex items-center gap-2">
          <span>Página {page + 1} de {totalPages}</span>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="grid size-8 place-items-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="grid size-8 place-items-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Próxima página"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
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
