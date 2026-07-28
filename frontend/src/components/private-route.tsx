import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth";

export function PrivateRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { authenticated, loading, isAdmin, blockedReason } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">
        Carregando…
      </div>
    );
  }

  // Precede o check de autenticação: o bloqueio derruba a sessão, então cair no
  // /login aqui reiniciaria o OAuth e voltaria para o mesmo estado, em loop.
  if (blockedReason) {
    return <Navigate to="/acesso-pendente" replace />;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
