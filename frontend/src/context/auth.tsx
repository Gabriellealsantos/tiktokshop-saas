import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { TokenPayload } from "./context-token";
import type { UserResponse } from "@/models/user";
import { mapUserResponse } from "@/models/user";
import { getAccessTokenPayload, isAuthenticated } from "@/utils/token";
import { loginRedirect, logout as doLogout } from "@/utils/requests";
import { findMe } from "@/services/userService";

type AuthContextData = {
  authenticated: boolean;
  loading: boolean;
  tokenPayload?: TokenPayload;
  user?: UserResponse;
  roles: string[];
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
  reloadUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserResponse | undefined>(undefined);
  const [tokenPayload, setTokenPayload] = useState<TokenPayload | undefined>(
    getAccessTokenPayload(),
  );

  const reloadUser = useCallback(async () => {
    try {
      const res = await findMe();
      const userModel = mapUserResponse(res.data as UserResponse);

      // Bloqueia usuários comuns sem plano ou bloqueados
      if (userModel.status === "bloqueado") {
        doLogout();
        setUser(undefined);
        window.location.href = "/login?error=locked";
        return;
      }

      if (userModel.role === "user" && userModel.plan === "sem_plano") {
        doLogout();
        setUser(undefined);
        window.location.href = "/login?error=disabled";
        return;
      }

      setUser(res.data as UserResponse);
    } catch {
      // 401/refresh é tratado pelo interceptor do axios.
      setUser(undefined);
    }
  }, []);

  useEffect(() => {
    async function bootstrap() {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }
      setTokenPayload(getAccessTokenPayload());
      await reloadUser();
      setLoading(false);
    }
    bootstrap();
  }, [reloadUser]);

  const login = useCallback(() => {
    void loginRedirect();
  }, []);

  const logout = useCallback(() => {
    setUser(undefined);
    setTokenPayload(undefined);
    doLogout();
  }, []);

  const roles = tokenPayload?.authorities ?? [];
  const authenticated = isAuthenticated() && !!user;

  const value = useMemo<AuthContextData>(
    () => ({
      authenticated,
      loading,
      tokenPayload,
      user,
      roles,
      isAdmin: roles.includes("ROLE_ADMIN"),
      login,
      logout,
      reloadUser,
    }),
    [authenticated, loading, tokenPayload, user, roles, login, logout, reloadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
