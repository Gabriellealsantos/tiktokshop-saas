import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth";

export function PrivateRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { authenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">
        Carregando…
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
