import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { User, UserRole, UserStatus, UserPlan } from "@/models/user";
import { mapUserResponse } from "@/models/user";
import { useAuth } from "./auth";

export type { User, UserRole, UserStatus, UserPlan };

/**
 * Camada de compatibilidade. A autenticação real vive em `context/auth.tsx`
 * (useAuth). Este shim preserva a interface antiga (`useMockSession`) para as
 * telas ainda não migradas, e mantém localmente os campos que ainda não têm
 * back (credits, notificações). Migrar tela a tela para `useAuth` e remover.
 */
type MockSession = {
  loggedIn: boolean;
  user: User;
  role: UserRole;
  credits: number;
  notificationsEnabled: boolean;
  login: () => void;
  logout: () => void;
  toggleRole: () => void;
  setCredits: (credits: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  updateUser: (data: Partial<User>) => void;
};

const MockSessionContext = createContext<MockSession | null>(null);

const GUEST_USER: User = {
  id: "",
  name: "",
  email: "",
  status: "pendente",
  role: "user",
  plan: "sem_plano",
  createdAt: new Date().toISOString(),
};

export function MockSessionProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  const [credits, setCredits] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  // Override local só para o toggle ADMIN/USER de preview; null = usa o real.
  const [roleOverride, setRoleOverride] = useState<UserRole | null>(null);
  const [userOverride, setUserOverride] = useState<Partial<User>>({});

  const baseUser: User = auth.user
    ? mapUserResponse(auth.user)
    : GUEST_USER;

  const user: User = { ...baseUser, ...userOverride };
  const role: UserRole = roleOverride ?? user.role;

  const value = useMemo<MockSession>(
    () => ({
      loggedIn: auth.authenticated,
      user,
      role,
      credits,
      notificationsEnabled,
      login: auth.login,
      logout: auth.logout,
      toggleRole: () =>
        setRoleOverride((r) => ((r ?? user.role) === "admin" ? "user" : "admin")),
      setCredits,
      setNotificationsEnabled,
      updateUser: (data: Partial<User>) => setUserOverride((u) => ({ ...u, ...data })),
    }),
    [auth.authenticated, auth.login, auth.logout, user, role, credits, notificationsEnabled],
  );

  return <MockSessionContext.Provider value={value}>{children}</MockSessionContext.Provider>;
}

export function useMockSession() {
  const context = useContext(MockSessionContext);
  if (!context) throw new Error("useMockSession precisa estar dentro de MockSessionProvider");
  return context;
}
