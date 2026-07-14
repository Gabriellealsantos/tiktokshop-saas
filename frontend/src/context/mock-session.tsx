import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { User, UserRole, UserStatus, UserPlan } from "@/models/user";

export type { User, UserRole, UserStatus, UserPlan };

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

export function MockSessionProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(true);
  const [credits, setCredits] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const [user, setUser] = useState<User>({
    id: "usr_123",
    name: "Marina Rocha",
    email: "marina@exemplo.com",
    status: "aprovado",
    role: "admin",
    plan: "mensal",
    createdAt: "2023-05-12T10:00:00Z",
    planExpiresAt: "2026-07-12T10:00:00Z"
  });

  const value = useMemo(
    () => ({
      loggedIn,
      user,
      role: user.role,
      credits,
      notificationsEnabled,
      login: () => setLoggedIn(true),
      logout: () => setLoggedIn(false),
      toggleRole: () => setUser(u => ({ ...u, role: u.role === "admin" ? "user" : "admin" })),
      setCredits,
      setNotificationsEnabled,
      updateUser: (data: Partial<User>) => setUser(u => ({ ...u, ...data })),
    }),
    [loggedIn, user, credits, notificationsEnabled],
  );
  return <MockSessionContext.Provider value={value}>{children}</MockSessionContext.Provider>;
}

export function useMockSession() {
  const context = useContext(MockSessionContext);
  if (!context) throw new Error("useMockSession precisa estar dentro de MockSessionProvider");
  return context;
}
