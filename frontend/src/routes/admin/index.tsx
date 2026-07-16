import { useState, useMemo, useEffect, useCallback } from "react";
import { Search, RefreshCw, Ban, Check, Clock3, CircleUser, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { Button, EmptyState, Pill, Page, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { useAuth } from "@/context/auth";
import { mapUserResponse } from "@/models/user";
import type { User, UserRole, UserStatus, UserPlan, UserResponse } from "@/models/user";
import { findAllUsers, updateUser } from "@/services/userService";
import { activateSubscription, revokeSubscription, cancelSubscription, planToBackend } from "@/services/subscriptionService";
import { cn } from "@/utils/utils";
import { MetricsTab } from "./components/metrics-tab";
import { InsightsTab } from "./components/insights-tab";
import { LiveSalesTab } from "./components/live-sales-tab";

export default function AdminScreen() {
  const { isAdmin } = useAuth();

  const [tab, setTab] = useState("Usuários");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<Record<string, UserPlan>>({});
  const [pendingRole, setPendingRole] = useState<Record<string, UserRole>>({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "todos">("todos");
  const [roleFilter, setRoleFilter] = useState<UserRole | "todas">("todas");
  const [planFilter, setPlanFilter] = useState<UserPlan | "todos">("todos");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await findAllUsers({ page: 0, size: 100 });
      const content: UserResponse[] = res.data.content ?? [];
      setUsers(content.map(mapUserResponse));
    } catch {
      toast.error("Falha ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin, loadUsers]);

  const pendingCount = users.filter((u) => u.status === "pendente").length;

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

  if (!isAdmin) {
    return (
      <AppShell>
        <Page>
          <EmptyState title="Acesso Negado" description="Esta página é restrita a administradores." />
        </Page>
      </AppShell>
    );
  }

  const handleRefresh = () => {
    loadUsers();
    toast("Atualizando dados…");
  };

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

  return (
    <AppShell>
      <Page className="max-w-[1200px]">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-8 entrance">
          <div>
            <h1 className="text-3xl font-extrabold tracking-[-.035em] text-white md:text-4xl">
              Painel Admin
            </h1>
            <p className="mt-2 text-sm text-zinc-400">Gerencie usuários e permissões</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-400">
              <Clock3 className="size-3.5" />
              {pendingCount} pendentes
            </span>
            <Button variant="secondary" onClick={handleRefresh} className="size-9 p-0 rounded-full" aria-label="Atualizar">
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide entrance">
          {["Usuários", "Métricas", "Tendências", "Vendas ao Vivo"].map((x) => (
            <Pill key={x} active={tab === x} onClick={() => setTab(x)}>
              {x}
            </Pill>
          ))}
        </div>

        {tab === "Usuários" && (
          <div className="space-y-6 entrance">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Buscar por email ou nome..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 w-full rounded-[12px] border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
                  <Select value={roleFilter} onValueChange={(val: string) => setRoleFilter(val as UserRole | "todas")}>
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

                  <Select value={planFilter} onValueChange={(val: string) => setPlanFilter(val as UserPlan | "todos")}>
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
                <Pill active={statusFilter === "todos"} onClick={() => setStatusFilter("todos")}>
                  Todos <span className="ml-1.5 opacity-50">{users.length}</span>
                </Pill>
                <Pill active={statusFilter === "aprovado"} onClick={() => setStatusFilter("aprovado")}>
                  Aprovados <span className="ml-1.5 opacity-50">{users.filter((u) => u.status === "aprovado").length}</span>
                </Pill>
                <Pill active={statusFilter === "pendente"} onClick={() => setStatusFilter("pendente")}>
                  Pendentes <span className="ml-1.5 opacity-50">{users.filter((u) => u.status === "pendente").length}</span>
                </Pill>
                <Pill active={statusFilter === "bloqueado"} onClick={() => setStatusFilter("bloqueado")}>
                  Bloqueados <span className="ml-1.5 opacity-50">{users.filter((u) => u.status === "bloqueado").length}</span>
                </Pill>
              </div>

              {(search || statusFilter !== "todos" || roleFilter !== "todas" || planFilter !== "todos") && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-zinc-500 mr-1">Filtros ativos:</span>
                  {search && (
                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                      Busca: {search}
                      <button onClick={() => setSearch("")} className="hover:text-white"><X className="size-3" /></button>
                    </span>
                  )}
                  {statusFilter !== "todos" && (
                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                      Status: {statusFilter}
                      <button onClick={() => setStatusFilter("todos")} className="hover:text-white"><X className="size-3" /></button>
                    </span>
                  )}
                  {roleFilter !== "todas" && (
                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                      Role: {roleFilter}
                      <button onClick={() => setRoleFilter("todas")} className="hover:text-white"><X className="size-3" /></button>
                    </span>
                  )}
                  {planFilter !== "todos" && (
                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                      Plano: {planFilter}
                      <button onClick={() => setPlanFilter("todos")} className="hover:text-white"><X className="size-3" /></button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("todos");
                      setRoleFilter("todas");
                      setPlanFilter("todos");
                    }}
                    className="text-xs text-brand-400 hover:text-brand-300 hover:underline ml-2"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>

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
                  const isBlocked = user.status === "bloqueado";
                  const hasChanges = selectedPlan !== user.plan || selectedRole !== user.role || user.status === "pendente";
                  return (
                    <div
                      key={user.id}
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
                        <Select value={selectedPlan} onValueChange={(val: UserPlan) => handlePlanChange(user.id, val)}>
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

                        <Select value={selectedRole} onValueChange={(val: UserRole) => handleRoleChange(user.id, val)}>
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
                            onClick={() => handleAtualizar(user)}
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
                            onClick={() => handleToggleBlock(user)}
                            disabled={busy}
                          >
                            <Ban className="size-3.5 mr-1.5" />
                            {isBlocked ? "Desbloquear" : "Bloquear"}
                          </Button>
                        </div>
                      </div>
                    </div>
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
        )}

        {tab === "Métricas" && <MetricsTab />}

        {tab === "Tendências" && <InsightsTab />}

        {tab === "Vendas ao Vivo" && <LiveSalesTab />}
      </Page>
    </AppShell>
  );
}
