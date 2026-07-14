import { Navigate, Outlet } from "react-router-dom";
import { useMockSession } from "@/context/mock-session";

export function PrivateRoute() {
  const { loggedIn } = useMockSession();

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
