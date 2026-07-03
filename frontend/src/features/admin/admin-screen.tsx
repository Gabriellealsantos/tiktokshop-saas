import { useState, useMemo } from "react";
import { Search, RefreshCw, Ban, Check, Clock3, CircleUser, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { Button, EmptyState, Pill } from "@/components/base/primitives";
import { Page } from "@/components/base/page";
import { AppShell } from "@/layouts/app-shell";
import { useMockSession, User, UserRole, UserStatus, UserPlan } from "@/lib/mock-session";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialUsers: User[] = [
  { id: "1", name: "Alice Silva", email: "alice@example.com", status: "aprovado", role: "user", plan: "mensal", createdAt: "2024-05-10T14:30:00Z" },
  { id: "2", name: "Bruno Costa", email: "bruno@example.com", status: "pendente", role: "user", plan: "sem_plano", createdAt: "2024-06-15T09:12:00Z" },
  { id: "3", name: "Carla Nunes", email: "carla@example.com", status: "bloqueado", role: "afiliado", plan: "anual", createdAt: "2023-11-20T16:45:00Z" },
  { id: "4", name: "Daniel Rocha", email: "daniel@example.com", status: "pendente", role: "user", plan: "sem_plano", createdAt: "2024-06-16T11:20:00Z" },
  { id: "5", name: "Elena Marques", email: "elena@example.com", status: "aprovado", role: "admin", plan: "vitalicio", createdAt: "2022-01-05T08:00:00Z" },
];

export function AdminScreen() {
  const { role } = useMockSession();
  
  const [tab, setTab] = useState("Usuários");
  const [users, setUsers] = useState(initialUsers);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "todos">("todos");
  const [roleFilter, setRoleFilter] = useState<UserRole | "todas">("todas");
  const [planFilter, setPlanFilter] = useState<UserPlan | "todos">("todos");

  if (role !== "admin") {
    return (
      <AppShell>
        <Page>
          <EmptyState
            title="Acesso Negado"
            description="Esta página é restrita a administradores."
          />
        </Page>
      </AppShell>
    );
  }

  // Derived state
  const pendingCount = users.filter(u => u.status === "pendente").length;
  
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "todos" || u.status === statusFilter;
      const matchRole = roleFilter === "todas" || u.role === roleFilter;
      const matchPlan = planFilter === "todos" || u.plan === planFilter;
      return matchSearch && matchStatus && matchRole && matchPlan;
    });
  }, [users, search, statusFilter, roleFilter, planFilter]);

  const handleRefresh = () => {
    toast("Atualizando dados... (TODO: integrar com backend)");
    // TODO: invalidate query
  };

  const handleUpdateStatus = (id: string, status: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    toast.success(`Status atualizado para ${status} (TODO: mutation)`);
  };

  const handleUpdatePlan = (id: string, plan: UserPlan) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, plan } : u));
    toast.success(`Plano atualizado para ${plan} (TODO: mutation)`);
  };

  const statusColors: Record<UserStatus, string> = {
    aprovado: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pendente: "bg-violet-500/10 text-violet-400 border-violet-500/20",
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
            <p className="mt-2 text-sm text-zinc-400">
              Gerencie usuários e permissões
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-400">
              <Clock3 className="size-3.5" />
              {pendingCount} pendentes
            </span>
            <Button variant="secondary" onClick={handleRefresh} className="size-9 p-0 rounded-full" aria-label="Atualizar">
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide entrance">
          {["Usuários", "Métricas", "Cupom Indicação"].map((x) => (
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
                    className="h-11 w-full rounded-[12px] border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all"
                  />
                </div>
                
                <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
                  <Select value={roleFilter} onValueChange={(val: any) => setRoleFilter(val)}>
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

                  <Select value={planFilter} onValueChange={(val: any) => setPlanFilter(val)}>
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
                  Aprovados <span className="ml-1.5 opacity-50">{users.filter(u => u.status === "aprovado").length}</span>
                </Pill>
                <Pill active={statusFilter === "pendente"} onClick={() => setStatusFilter("pendente")}>
                  Pendentes <span className="ml-1.5 opacity-50">{users.filter(u => u.status === "pendente").length}</span>
                </Pill>
                <Pill active={statusFilter === "bloqueado"} onClick={() => setStatusFilter("bloqueado")}>
                  Bloqueados <span className="ml-1.5 opacity-50">{users.filter(u => u.status === "bloqueado").length}</span>
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
                    className="text-xs text-violet-400 hover:text-violet-300 hover:underline ml-2"
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

            <div className="grid gap-3">
              {filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  className={cn(
                    "flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 rounded-[16px] border p-5 transition-colors",
                    user.status === "pendente" 
                      ? "border-violet-500/30 bg-violet-500/[0.03] hover:bg-violet-500/[0.05]" 
                      : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-white truncate">{user.email}</span>
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", statusColors[user.status])}>
                        {user.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20">
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
                    <Select 
                      value={user.plan} 
                      onValueChange={(val: UserPlan) => handleUpdatePlan(user.id, val)}
                    >
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

                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-9 px-3 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 disabled:opacity-30 disabled:border-transparent"
                        onClick={() => handleUpdateStatus(user.id, "aprovado")}
                        disabled={user.status === "aprovado"}
                      >
                        <Check className="size-3.5 mr-1.5" />
                        Liberar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-9 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 disabled:opacity-30 disabled:border-transparent"
                        onClick={() => handleUpdateStatus(user.id, "bloqueado")}
                        disabled={user.status === "bloqueado"}
                      >
                        <Ban className="size-3.5 mr-1.5" />
                        Bloquear
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="py-12 text-center text-zinc-500 text-sm">
                  Nenhum usuário encontrado com os filtros atuais.
                </div>
              )}
            </div>
          </div>
        )}

        {(tab === "Métricas" || tab === "Cupom Indicação") && (
          <div className="py-12">
            <EmptyState
              title="Em construção"
              description={`A aba de ${tab} está sendo desenvolvida e estará disponível em breve.`}
            />
          </div>
        )}
      </Page>
    </AppShell>
  );
}
