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

export type AccessBlockReason = "sem_plano" | "bloqueado";

type AuthContextData = {
  authenticated: boolean;
  loading: boolean;
  tokenPayload?: TokenPayload;
  user?: UserResponse;
  roles: string[];
  isAdmin: boolean;
  blockedReason?: AccessBlockReason;
  login: () => void;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserResponse | undefined>(undefined);
  const [tokenPayload, setTokenPayload] = useState<TokenPayload | undefined>(
    getAccessTokenPayload(),
  );

  const [blockedReason, setBlockedReason] = useState<AccessBlockReason | undefined>(
    undefined,
  );

  const reloadUser = useCallback(async () => {
    try {
      const res = await findMe();
      const userModel = mapUserResponse(res.data as UserResponse);

      // Bloqueia usuários comuns sem plano ou bloqueados. O redirect fica a cargo
      // do PrivateRoute (via blockedReason) — navegar aqui competia com o Navigate
      // dele e gerava loop de login.
      const reason: AccessBlockReason | undefined =
        userModel.status === "bloqueado"
          ? "bloqueado"
          : userModel.role === "user" && userModel.plan === "sem_plano"
            ? "sem_plano"
            : undefined;

      if (reason) {
        await doLogout(null);
        setUser(undefined);
        setTokenPayload(undefined);
        setBlockedReason(reason);
        return;
      }

      setBlockedReason(undefined);
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

  // Aguarda a revogação no servidor ANTES de limpar o estado local. Limpar antes
  // derruba `authenticated`, o PrivateRoute navega para /login e o /login dispara
  // /oauth2/authorize com o JSESSIONID ainda vivo — o Authorization Server
  // reautentica em silêncio e o usuário volta logado, como se não conseguisse sair.
  // O redirect final fica por conta do doLogout, para não competir com esse fluxo.
  const logout = useCallback(async () => {
    await doLogout();
    setUser(undefined);
    setTokenPayload(undefined);
    setBlockedReason(undefined);
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
      blockedReason,
      login,
      logout,
      reloadUser,
    }),
    [
      authenticated,
      loading,
      tokenPayload,
      user,
      roles,
      blockedReason,
      login,
      logout,
      reloadUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
